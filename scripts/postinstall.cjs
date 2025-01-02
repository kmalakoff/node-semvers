var Cache = require('fetch-json-cache');
var constants = require('../assets/constants.cjs');

function cache(callback) {
  var cache = new Cache(constants.CACHE_PATH);
  cache.get(constants.DISTS_URL, { force: true }, function (err) {
    err ? callback(err) : cache.get(constants.SCHEDULES_URL, { force: true }, callback);
  });
}

// run patch
cache(function (err) {
  if (err) {
    console.log('postinstall failed. Error: ' + err.message);
    process.exit(-1);
  } else {
    console.log('postinstall succeeded');
    process.exit(0);
  }
});
