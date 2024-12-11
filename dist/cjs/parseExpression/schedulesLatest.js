"use strict";
var schedulesForEach = require('./schedulesForEach');
module.exports = function schedulesLatest(schedules, filter) {
    var latest = null;
    schedulesForEach(schedules, filter, function(schedule) {
        if (!latest || latest.start < schedule.start) latest = schedule;
    });
    return latest;
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }