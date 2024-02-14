"use strict";
module.exports = function normalizeSchedule(name, raw) {
    var schedule = {
        name: name,
        semver: name.slice(1),
        raw: raw
    };
    schedule.start = new Date(raw.start);
    schedule.end = new Date(raw.end);
    if (raw.codename) schedule.codename = raw.codename.toLowerCase();
    if (raw.lts) schedule.lts = new Date(raw.lts);
    if (raw.maintenance) schedule.maintenance = new Date(raw.maintenance);
    return schedule;
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}