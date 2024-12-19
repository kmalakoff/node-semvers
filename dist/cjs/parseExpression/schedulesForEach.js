"use strict";
module.exports = function schedulesForEach(schedules, filter, fn) {
    for(var index = 0; index < schedules.length; index++){
        var schedule = schedules[index];
        !filter(schedule) || fn(schedule);
    }
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }