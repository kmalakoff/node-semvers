var Cache = require('fetch-json-cache');
var constants = require('./constants.cjs');

module.exports = function postinstall() {
  var cacheJSON = function cacheJSON(callback) {
    cache.get(
      constants.DISTS_URL,
      {
        force: true,
      },
      function (err) {
        err
          ? callback(err)
          : cache.get(
              constants.SCHEDULES_URL,
              {
                force: true,
              },
              callback
            );
      }
    );
  };
  var cache = new Cache(constants.CACHE_PATH);
  cacheJSON(function (err) {
    if (err) {
      console.log(`postinstall failed. Error: ${err.message}`);
      process.exit(-1);
    } else {
      console.log('postinstall succeeded');
      process.exit(0);
    }
  });
};
