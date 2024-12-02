// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
"use strict";
module.exports = function isNaN(value) {
    // biome-ignore lint/suspicious/noSelfCompare: <explanation>
    return value !== value;
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }