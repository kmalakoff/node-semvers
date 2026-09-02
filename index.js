var semver = require('semver');
var findLast = require('lodash.findlast');

var parseExpression = require('./lib/parseExpression');
var fetchHTTP = require('./lib/fetchHTTP');
var fetchCache = require('./lib/fetchCache');
var normalizeSchedule = require('./lib/normalizeSchedule');
var normalizeVersion = require('./lib/normalizeVersion');

function NodeVersions(versions, schedule) {
  if (!versions) throw new Error('Missing option: versions');
  if (!schedule) throw new Error('Missing option: schedule');

  this.schedules = [];
  for (var name in schedule) this.schedules.push(normalizeSchedule(name, schedule[name]));
  this.schedules = this.schedules.sort(function (a, b) {
    return semver.gt(semver.coerce(a.name), semver.coerce(b.name)) ? 1 : -1;
  });

  this.versions = [];
  for (var index = 0; index < versions.length; index++) this.versions.push(normalizeVersion(versions[index], this.schedules));
  this.versions = this.versions.sort(function (a, b) {
    return semver.gt(a.version, b.version) ? 1 : -1;
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
    return new Promise(function forEachPromise(resolve, reject) {
      load(options, function loadCallback(err, NodeVersions) {
        err ? reject(err) : resolve(NodeVersions);
      });
    });
  }
};

NodeVersions.prototype.resolve = function resolve(expression, options) {
  options = options || {};
  var parsed = parseExpression.call(this, expression, options.now || new Date());
  var version;

  // single result, try a match
  if (parsed) {
    version = findLast(this.versions, function (x) {
      for (var key in parsed) {
        if (x[key] !== parsed[key]) return false;
      }
      return true;
    });
    if (version) return version;
  }

  // try an expression
  var results = [];
  for (var index = 0; index < this.versions.length; index++) {
    version = this.versions[index];
    !semver.satisfies(version.version, expression) || results.push(version);
  }
  return results;
};

module.exports = NodeVersions;
