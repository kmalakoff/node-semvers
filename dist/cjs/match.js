"use strict";
module.exports = function match(test, query) {
    for(var key in query){
        if (test[key] !== query[key]) return false;
    }
    return true;
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }