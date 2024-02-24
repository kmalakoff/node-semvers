"use strict";
module.exports.even = function even(version) {
    var major = version.major === 0 ? version.minor : version.major;
    return major % 2 === 0;
};
module.exports.odd = function odd(version) {
    var major = version.major === 0 ? version.minor : version.major;
    return major % 2 === 1;
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }