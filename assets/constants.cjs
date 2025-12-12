'use strict';
var path = require('path');
module.exports = {
  CACHE_PATH: path.join(__dirname, '..', '.cache'),
  DISTS_URL: 'https://nodejs.org/dist/index.json',
  SCHEDULES_URL: 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json',
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) {
  try {
    Object.defineProperty(exports.default, '__esModule', { value: true });
    for (var key in exports) {
      exports.default[key] = exports[key];
    }
  } catch (_) {}
  module.exports = exports.default;
}
