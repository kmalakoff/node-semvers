var Cache = require('fetch-json-cache');
var constants = require('../assets/constants.cjs');

function fetchWithRetry(cache, url, retries, callback) {
  cache.get(url, { force: true }, function (err) {
    if (err && retries > 0) {
      setTimeout(function () {
        fetchWithRetry(cache, url, retries - 1, callback);
      }, 1000);
    } else {
      callback(err);
    }
  });
}

function cacheWithRetry(callback) {
  var cache = new Cache(constants.CACHE_PATH);
  fetchWithRetry(cache, constants.DISTS_URL, 3, function (err) {
    if (err) return callback(err);
    fetchWithRetry(cache, constants.SCHEDULES_URL, 3, callback);
  });
}

// run patch
cacheWithRetry(function (err) {
  if (err) {
    console.log('postinstall warning: ' + err.message);
    console.log('Cache not updated after retries.');
    process.exit(0);
  } else {
    console.log('postinstall succeeded');
    process.exit(0);
  }
});
