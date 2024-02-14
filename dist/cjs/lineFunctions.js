"use strict";
module.exports.even = function even(version) {
    var major = version.major === 0 ? version.minor : version.major;
    return major % 2 === 0;
};
module.exports.odd = function odd(version) {
    var major = version.major === 0 ? version.minor : version.major;
    return major % 2 === 1;
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}