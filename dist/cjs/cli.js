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
var _getoptscompat = /*#__PURE__*/ _interop_require_default(require("getopts-compat"));
var _index = /*#__PURE__*/ _interop_require_default(require("./index.js"));
var _isarray = /*#__PURE__*/ _interop_require_default(require("isarray"));
var _isNaN = /*#__PURE__*/ _interop_require_default(require("./isNaN.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = function(argv) {
    var stringify = function stringify(value) {
        return typeof value === "string" ? value : JSON.stringify(value);
    };
    var options = (0, _getoptscompat.default)(argv.slice(1), {
        alias: {
            path: "p",
            range: "r",
            now: "n"
        },
        stopEarly: true
    });
    if (typeof options.now !== "undefined") options.now = new Date((0, _isNaN.default)(+options.now) ? Date.parse(options.now) : +options.now);
    // define.option('-p, --path [path]', 'path within version including raw for unprocessed version', 'version');
    // define.option('-r, --range [range]', 'range type of major, minor, or patch with filters of lts, even, odd for version string expressions', 'patch');
    // define.option('-n, --now [date]', 'use a specific time as a Date.parse');
    if (options.help) {
        console.log("");
        console.log("Example call:");
        console.log("  $ nv [version string]");
        console.log("");
        console.log("Version Strings:");
        console.log("Any command that calls for a version can be provided any of the");
        console.log('following "version-ish" identifies:');
        console.log("");
        console.log("- x.y.z        A specific SemVer tuple");
        console.log("- x.y          Major and minor version number");
        console.log("- x            Just a major version number");
        console.log("- lts          The most recent LTS (long-term support) node version");
        console.log("- lts/<name>   The latest in a named LTS set. (argon, boron, etc.)");
        console.log('- lts/*        Same as just "lts"');
        console.log("- latest       The most recent (non-LTS) version");
        console.log('- stable       Backwards-compatible alias for "lts"');
        console.log('- [expression] Engine and semver module expression like "10.1.x || >=12.0.0"');
        return;
    }
    var args = argv.slice(0, 1).concat(options._);
    if (args.length < 1) {
        console.log("Missing version string. Example usage: nv [version string]. Use nv --help for information on version strings");
        return (0, _exit.default)(-1);
    }
    _index.default.load(options, function(err, semvers) {
        if (err) {
            console.log(err.message);
            return (0, _exit.default)(err.code || -1);
        }
        var version = semvers.resolve(args[0], options);
        if (!version || (0, _isarray.default)(version) && !version.length) {
            console.log("Unrecognized: ".concat(args[0]));
            return (0, _exit.default)(-1);
        }
        console.log("versions:");
        if ((0, _isarray.default)(version)) {
            for(var index = 0; index < version.length; index++)console.log(stringify(version[index]));
        } else console.log(stringify(version));
        (0, _exit.default)(0);
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}