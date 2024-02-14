"use strict";
module.exports.major = function major(version) {
    return version.major === 0 ? "".concat(version.major, ".").concat(version.minor) : version.major;
};
module.exports.minor = function minor(version) {
    return version.major === 0 ? "".concat(version.major, ".").concat(version.minor, ".").concat(version.patch) : "".concat(version.major, ".").concat(version.minor);
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}