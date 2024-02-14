"use strict";
var semver = require("semver");
var Cache = require("fetch-json-cache");
var constants = require("./constants");
var keyFunctions = require("./keyFunctions");
var lineFunctions = require("./lineFunctions");
var normalizeSchedule = require("./normalizeSchedule");
var normalizeVersion = require("./normalizeVersion");
var match = require("./match");
var parseExpression = require("./parseExpression");
function NodeVersions(versions, schedule) {
    if (!versions) throw new Error("Missing option: versions");
    if (!schedule) throw new Error("Missing option: schedule");
    this.schedules = [];
    for(var name in schedule)this.schedules.push(normalizeSchedule(name, schedule[name]));
    this.schedules = this.schedules.sort(function(a, b) {
        return semver.gt(semver.coerce(a.semver), semver.coerce(b.semver)) ? 1 : -1;
    });
    this.versions = [];
    for(var index = 0; index < versions.length; index++)this.versions.push(normalizeVersion(versions[index], this.schedules));
    this.versions = this.versions.sort(function(a, b) {
        return semver.gt(a.semver, b.semver) ? -1 : 1;
    });
}
NodeVersions.load = function load(options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = null;
    }
    if (typeof callback === "function") {
        options = options || {};
        var cache = new Cache(options.cacheDirectory || constants.CACHE_DIRECTORY);
        cache.get(constants.DISTS_URL, function(err, versions) {
            if (err) return callback(err);
            cache.get(constants.SCHEDULES_URL, function(err, schedule) {
                err ? callback(err) : callback(null, new NodeVersions(versions, schedule));
            });
        });
    } else {
        return new Promise(function(resolve, reject) {
            load(options, function loadCallback(err, NodeVersions) {
                err ? reject(err) : resolve(NodeVersions);
            });
        });
    }
};
NodeVersions.loadSync = function loadSync(options) {
    options = options || {};
    var cache = new Cache(options.cacheDirectory || constants.CACHE_DIRECTORY);
    var versions = cache.getSync(constants.DISTS_URL);
    var schedule = cache.getSync(constants.SCHEDULES_URL);
    if (!versions || !schedule) return null;
    return new NodeVersions(versions, schedule);
};
NodeVersions.prototype.resolve = function resolve(expression, options) {
    options = options || {};
    var path = options.path || "version";
    // normalize
    if (typeof expression === "number") expression = "".concat(expression);
    if (typeof expression !== "string") return null;
    expression = expression.trim();
    // single result, try a match
    var query = parseExpression.call(this, expression, options.now || new Date());
    if (query) {
        var version = null;
        for(var index = 0; index < this.versions.length; index++){
            var test = this.versions[index];
            if (options.now && options.now < test.date) continue;
            if (!match(test, query)) continue;
            version = test;
            break;
        }
        if (version) return version[path];
    }
    // filtered expression
    var range = options.range || "";
    var filters = {
        lts: !!~range.indexOf("lts")
    };
    filters.key = ~range.indexOf("major") ? keyFunctions.major : ~range.indexOf("minor") ? keyFunctions.minor : undefined;
    filters.line = ~range.indexOf("even") ? lineFunctions.even : ~range.indexOf("odd") ? lineFunctions.odd : undefined;
    var results = [];
    var founds = {};
    for(var index1 = 0; index1 < this.versions.length; index1++){
        var test1 = this.versions[index1];
        if (options.now && options.now < test1.date) continue;
        if (filters.lts && !test1.lts) continue;
        if (filters.line && !filters.line(test1)) continue;
        if (!semver.satisfies(test1.semver, expression)) continue;
        if (filters.key) {
            if (founds[filters.key(test1)]) continue;
            founds[filters.key(test1)] = true;
        }
        results.unshift(test1[path]);
    }
    return results;
};
module.exports = NodeVersions;

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}