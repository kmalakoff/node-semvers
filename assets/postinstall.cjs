'use strict';
var exit = require('exit-compat');
var Cache = require('fetch-json-cache');
var _require = require('./constants.cjs');
var CACHE_PATH = _require.CACHE_PATH;
var DISTS_URL = _require.DISTS_URL;
var SCHEDULES_URL = _require.SCHEDULES_URL;
function fetchWithRetry(cache, url, retries, callback) {
  cache.get(
    url,
    {
      force: true,
    },
    function (err) {
      if (err && retries > 0) {
        setTimeout(function () {
          fetchWithRetry(cache, url, retries - 1, callback);
        }, 1000);
      } else {
        callback(err);
      }
    }
  );
}
function cacheWithRetry(callback) {
  var cache = new Cache(CACHE_PATH);
  fetchWithRetry(cache, DISTS_URL, 3, function (err) {
    if (err) return callback(err);
    fetchWithRetry(cache, SCHEDULES_URL, 3, callback);
  });
}
// run patch
cacheWithRetry(function (err) {
  if (err) {
    console.log('postinstall warning: '.concat(err.message));
    console.log('Cache not updated after retries.');
    exit(0);
  } else {
    console.log('postinstall succeeded');
    exit(0);
  }
});
/* CJS INTEROP */ if (exports.__esModule && exports.default) {
  try {
    Object.defineProperty(exports.default, '__esModule', { value: true });
    for (var key in exports) {
      exports.default[key] = exports[key];
    }
  } catch (_) {}
  module.exports = exports.default;
}
