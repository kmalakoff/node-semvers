"use strict";
var schedulesForEach = require("./schedulesForEach");
module.exports = function schedulesLatest(schedules, filter) {
    var latest = null;
    schedulesForEach(schedules, filter, function(schedule) {
        if (!latest || latest.start < schedule.start) latest = schedule;
    });
    return latest;
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}