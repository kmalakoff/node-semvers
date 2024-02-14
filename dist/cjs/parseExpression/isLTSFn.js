"use strict";
module.exports = function isLTSFn(now) {
    return function isLTS(item) {
        return item.lts && now >= item.start && now <= item.end;
    };
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}