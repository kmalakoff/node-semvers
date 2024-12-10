"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _exit = /*#__PURE__*/ _interop_require_default(require("exit"));
var _fetchjsoncache = /*#__PURE__*/ _interop_require_default(require("fetch-json-cache"));
var _constants = /*#__PURE__*/ _interop_require_default(require("../constants"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = function() {
    var cacheJSON = function cacheJSON(callback) {
        cache.get(_constants.default.DISTS_URL, {
            force: true
        }, function(err) {
            err ? callback(err) : cache.get(_constants.default.SCHEDULES_URL, {
                force: true
            }, callback);
        });
    };
    var cache = new _fetchjsoncache.default(_constants.default.CACHE_DIRECTORY);
    cacheJSON(function(err) {
        if (err) {
            console.log("Failed to cache dists and schedules. Error: ".concat(err.message));
            return (0, _exit.default)(err.code || -1);
        }
        (0, _exit.default)(0);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }