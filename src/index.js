const semver = require('semver');
const Cache = require('fetch-json-cache');

const constants = require('./constants');
const keyFunctions = require('./keyFunctions');
const lineFunctions = require('./lineFunctions');
const normalizeSchedule = require('./normalizeSchedule');
const normalizeVersion = require('./normalizeVersion');
const match = require('./match');
const parseExpression = require('./parseExpression');

function NodeVersions(versions, schedule) {
  if (!versions) throw new Error('Missing option: versions');
  if (!schedule) throw new Error('Missing option: schedule');

  this.schedules = [];
  for (const name in schedule) this.schedules.push(normalizeSchedule(name, schedule[name]));
  this.schedules = this.schedules.sort((a, b) => (semver.gt(semver.coerce(a.semver), semver.coerce(b.semver)) ? 1 : -1));

  this.versions = [];
  for (let index = 0; index < versions.length; index++) this.versions.push(normalizeVersion(versions[index], this.schedules));
  this.versions = this.versions.sort((a, b) => (semver.gt(a.semver, b.semver) ? -1 : 1));
}

NodeVersions.load = function load(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  if (typeof callback === 'function') {
    options = options || {};

    const cache = new Cache(options.cacheDirectory || constants.CACHE_DIRECTORY);
    cache.get(constants.DISTS_URL, (err, versions) => {
      if (err) return callback(err);

      cache.get(constants.SCHEDULES_URL, (err, schedule) => {
        err ? callback(err) : callback(null, new NodeVersions(versions, schedule));
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      load(options, function loadCallback(err, NodeVersions) {
        err ? reject(err) : resolve(NodeVersions);
      });
    });
  }
};

NodeVersions.loadSync = function loadSync(options) {
  options = options || {};
  const cache = new Cache(options.cacheDirectory || constants.CACHE_DIRECTORY);
  const versions = cache.getSync(constants.DISTS_URL);
  const schedule = cache.getSync(constants.SCHEDULES_URL);
  if (!versions || !schedule) return null;
  return new NodeVersions(versions, schedule);
};

NodeVersions.prototype.resolve = function resolve(expression, options) {
  options = options || {};
  const path = options.path || 'version';

  // normalize
  if (typeof expression === 'number') expression = `${expression}`;
  if (typeof expression !== 'string') return null;
  expression = expression.trim();

  // single result, try a match
  const query = parseExpression.call(this, expression, options.now || new Date());
  if (query) {
    let version = null;
    for (let index = 0; index < this.versions.length; index++) {
      const test = this.versions[index];
      if (options.now && options.now < test.date) continue;
      if (!match(test, query)) continue;
      version = test;
      break;
    }
    if (version) return version[path];
  }

  // filtered expression
  const range = options.range || '';
  const filters = { lts: !!~range.indexOf('lts') };
  filters.key = ~range.indexOf('major') ? keyFunctions.major : ~range.indexOf('minor') ? keyFunctions.minor : undefined;
  filters.line = ~range.indexOf('even') ? lineFunctions.even : ~range.indexOf('odd') ? lineFunctions.odd : undefined;

  const results = [];
  const founds = {};

  for (let index = 0; index < this.versions.length; index++) {
    const test = this.versions[index];
    if (options.now && options.now < test.date) continue;
    if (filters.lts && !test.lts) continue;
    if (filters.line && !filters.line(test)) continue;
    if (!semver.satisfies(test.semver, expression)) continue;
    if (filters.key) {
      if (founds[filters.key(test)]) continue;
      founds[filters.key(test)] = true;
    }
    results.unshift(test[path]);
  }
  return results;
};

module.exports = NodeVersions;
