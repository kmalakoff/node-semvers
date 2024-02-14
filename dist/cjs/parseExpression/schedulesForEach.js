"use strict";
module.exports = function schedulesForEach(schedules, filter, fn) {
    for(var index = 0; index < schedules.length; index++){
        var schedule = schedules[index];
        !filter(schedule) || fn(schedule);
    }
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}