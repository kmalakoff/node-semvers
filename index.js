var semver = require('semver');
var find = require('lodash.find');

var parseExpression = require('./lib/parseExpression');
var fetchHTTP = require('./lib/fetchHTTP');
var fetchCache = require('./lib/fetchCache');
var keyFunctions = require('./lib/keyFunctions');
var lineFunctions = require('./lib/lineFunctions');
var normalizeSchedule = require('./lib/normalizeSchedule');
var normalizeVersion = require('./lib/normalizeVersion');

function NodeVersions(versions, schedule) {
  if (!versions) throw new Error('Missing option: versions');
  if (!schedule) throw new Error('Missing option: schedule');

  this.schedules = [];
  for (var name in schedule) this.schedules.push(normalizeSchedule(name, schedule[name]));
  this.schedules = this.schedules.sort(function (a, b) {
    return semver.gt(semver.coerce(a.semver), semver.coerce(b.semver)) ? 1 : -1;
  });

  this.versions = [];
  for (var index = 0; index < versions.length; index++) this.versions.push(normalizeVersion(versions[index], this.schedules));
  this.versions = this.versions.sort(function (a, b) {
    return semver.gt(a.semver, b.semver) ? -1 : 1;
  });
}

NodeVersions.load = function load(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  if (typeof callback === 'function') {
    options = options || {};
    var fetch = options.cache ? fetchCache : fetchHTTP;

    fetch('https://nodejs.org/dist/index.json', function (err, versions) {
      if (err) return callback(err);

      fetch('https://raw.githubusercontent.com/nodejs/Release/master/schedule.json', function (err, schedule) {
        err ? callback(err) : callback(null, new NodeVersions(versions, schedule));
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      load(options, function loadCallback(err, NodeVersions) {
        err ? reject(err) : resolve(NodeVersions);
      });
    });
  }
};

NodeVersions.prototype.resolve = function resolve(expression, options) {
  options = options || {};
  if (typeof expression === 'number') expression = '' + expression;
  if (typeof expression !== 'string') return null;
  expression = expression.trim();
  var path = options.path || 'version';

  // single result, try a match
  var parsed = parseExpression.call(this, expression, options.now || new Date());
  if (parsed) {
    var version = find(this.versions, function (x) {
      for (var key in parsed) {
        if (x[key] !== parsed[key]) return false;
      }
      return true;
    });
    if (version) return version[path];
  }

  // filtered expression
  var range = options.range || '';
  var filters = { lts: !!~range.indexOf('lts') };
  filters.key = ~range.indexOf('major') ? keyFunctions.major : ~range.indexOf('minor') ? keyFunctions.minor : undefined;
  filters.line = ~range.indexOf('even') ? lineFunctions.even : ~range.indexOf('odd') ? lineFunctions.odd : undefined;

  var results = [];
  var founds = {};
  for (var index = 0; index < this.versions.length; index++) {
    // eslint-disable-next-line no-redeclare
    var version = this.versions[index];
    if (filters.lts && !version.lts) continue;
    if (filters.line && !filters.line(version)) continue;
    if (!semver.satisfies(version.semver, expression)) continue;
    if (filters.key) {
      if (founds[filters.key(version)]) continue;
      founds[filters.key(version)] = true;
    }
    results.unshift(version[path]);
  }
  return results;
};

module.exports = NodeVersions;
