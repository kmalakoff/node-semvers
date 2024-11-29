"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return NodeVersions;
    }
});
var _fetchjsoncache = /*#__PURE__*/ _interop_require_default(require("fetch-json-cache"));
var _semver = /*#__PURE__*/ _interop_require_default(require("semver"));
var _constants = /*#__PURE__*/ _interop_require_default(require("./constants"));
var _keyFunctions = /*#__PURE__*/ _interop_require_default(require("./keyFunctions"));
var _lineFunctions = /*#__PURE__*/ _interop_require_default(require("./lineFunctions"));
var _match = /*#__PURE__*/ _interop_require_default(require("./match"));
var _normalizeSchedule = /*#__PURE__*/ _interop_require_default(require("./normalizeSchedule"));
var _normalizeVersion = /*#__PURE__*/ _interop_require_default(require("./normalizeVersion"));
var _parseExpression = /*#__PURE__*/ _interop_require_default(require("./parseExpression"));
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var NodeVersions = /*#__PURE__*/ function() {
    "use strict";
    function NodeVersions(versions, schedule) {
        _class_call_check(this, NodeVersions);
        if (!versions) throw new Error('Missing option: versions');
        if (!schedule) throw new Error('Missing option: schedule');
        this.schedules = [];
        for(var name in schedule)this.schedules.push((0, _normalizeSchedule.default)(name, schedule[name]));
        this.schedules = this.schedules.sort(function(a, b) {
            return _semver.default.gt(_semver.default.coerce(a.semver), _semver.default.coerce(b.semver)) ? 1 : -1;
        });
        this.versions = [];
        for(var index = 0; index < versions.length; index++)this.versions.push((0, _normalizeVersion.default)(versions[index], this.schedules));
        this.versions = this.versions.sort(function(a, b) {
            return _semver.default.gt(a.semver, b.semver) ? -1 : 1;
        });
    }
    _create_class(NodeVersions, [
        {
            key: "resolve",
            value: function resolve(expression, options) {
                options = options || {};
                var path = options.path || 'version';
                // normalize
                if (typeof expression === 'number') expression = "".concat(expression);
                if (typeof expression !== 'string') return null;
                expression = expression.trim();
                // single result, try a match
                var query = _parseExpression.default.call(this, expression, options.now || new Date());
                if (query) {
                    var version = null;
                    for(var index = 0; index < this.versions.length; index++){
                        var test = this.versions[index];
                        if (options.now && options.now < test.date) continue;
                        if (!(0, _match.default)(test, query)) continue;
                        version = test;
                        break;
                    }
                    if (version) return version[path];
                }
                // filtered expression
                var range = options.range || '';
                var filters = {
                    lts: !!~range.indexOf('lts')
                };
                filters.key = ~range.indexOf('major') ? _keyFunctions.default.major : ~range.indexOf('minor') ? _keyFunctions.default.minor : undefined;
                filters.line = ~range.indexOf('even') ? _lineFunctions.default.even : ~range.indexOf('odd') ? _lineFunctions.default.odd : undefined;
                var results = [];
                var founds = {};
                for(var index1 = 0; index1 < this.versions.length; index1++){
                    var test1 = this.versions[index1];
                    if (options.now && options.now < test1.date) continue;
                    if (filters.lts && !test1.lts) continue;
                    if (filters.line && !filters.line(test1)) continue;
                    if (!_semver.default.satisfies(test1.semver, expression)) continue;
                    if (filters.key) {
                        if (founds[filters.key(test1)]) continue;
                        founds[filters.key(test1)] = true;
                    }
                    results.unshift(test1[path]);
                }
                return results;
            }
        }
    ], [
        {
            key: "load",
            value: function load(options, callback) {
                if (typeof options === 'function') {
                    callback = options;
                    options = null;
                }
                if (typeof callback === 'function') {
                    options = options || {};
                    var cache = new _fetchjsoncache.default(options.cacheDirectory || _constants.default.CACHE_DIRECTORY);
                    cache.get(_constants.default.DISTS_URL, function(err, versions) {
                        if (err) return callback(err);
                        cache.get(_constants.default.SCHEDULES_URL, function(err, schedule) {
                            err ? callback(err) : callback(null, new NodeVersions(versions, schedule));
                        });
                    });
                } else {
                    return new Promise(function(resolve, reject) {
                        NodeVersions.load(options, function loadCallback(err, NodeVersions) {
                            err ? reject(err) : resolve(NodeVersions);
                        });
                    });
                }
            }
        },
        {
            key: "loadSync",
            value: function loadSync(options) {
                options = options || {};
                var cache = new _fetchjsoncache.default(options.cacheDirectory || _constants.default.CACHE_DIRECTORY);
                var versions = cache.getSync(_constants.default.DISTS_URL);
                var schedule = cache.getSync(_constants.default.SCHEDULES_URL);
                if (!versions || !schedule) return null;
                return new NodeVersions(versions, schedule);
            }
        }
    ]);
    return NodeVersions;
}();
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }