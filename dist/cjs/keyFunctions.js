"use strict";
module.exports.major = function major(version) {
    return version.major === 0 ? "".concat(version.major, ".").concat(version.minor) : version.major;
};
module.exports.minor = function minor(version) {
    return version.major === 0 ? "".concat(version.major, ".").concat(version.minor, ".").concat(version.patch) : "".concat(version.major, ".").concat(version.minor);
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }