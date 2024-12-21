import exit from 'exit';
import Cache from 'fetch-json-cache';
// @ts-ignore
import constants from '../constants.cjs';

export default () => {
  const cache = new Cache(constants.CACHE_DIRECTORY);

  function cacheJSON(callback) {
    cache.get(constants.DISTS_URL, { force: true }, (err) => {
      err ? callback(err) : cache.get(constants.SCHEDULES_URL, { force: true }, callback);
    });
  }

  cacheJSON((err) => {
    if (err) {
      console.log(`Failed to cache dists and schedules. Error: ${err.message}`);
      return exit(err.code || -1);
    }
    exit(0);
  });
};
