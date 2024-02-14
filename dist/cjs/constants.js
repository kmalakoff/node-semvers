"use strict";
var path = require("path");
module.exports = {
    CACHE_DIRECTORY: path.resolve(path.join(__dirname, "..", "..", ".cache")),
    DISTS_URL: "https://nodejs.org/dist/index.json",
    SCHEDULES_URL: "https://raw.githubusercontent.com/nodejs/Release/master/schedule.json"
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}