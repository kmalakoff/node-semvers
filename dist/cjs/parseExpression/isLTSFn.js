"use strict";
module.exports = function isLTSFn(now) {
    return function isLTS(item) {
        return item.lts && now >= item.start && now <= item.end;
    };
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }