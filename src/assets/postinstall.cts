const exit = require('exit-compat');
const Cache = require('fetch-json-cache');
const { CACHE_PATH, DISTS_URL, SCHEDULES_URL } = require('./constants.cts');

type Callback = (err: Error | null) => void;

function fetchWithRetry(cache: typeof Cache.prototype, url: string, retries: number, callback: Callback) {
  cache.get(url, { force: true }, (err: Error | null) => {
    if (err && retries > 0) {
      setTimeout(() => {
        fetchWithRetry(cache, url, retries - 1, callback);
      }, 1000);
    } else {
      callback(err);
    }
  });
}

function cacheWithRetry(callback: Callback) {
  const cache = new Cache(CACHE_PATH);
  fetchWithRetry(cache, DISTS_URL, 3, (err) => {
    if (err) return callback(err);
    fetchWithRetry(cache, SCHEDULES_URL, 3, callback);
  });
}

// run patch
cacheWithRetry((err) => {
  if (err) {
    console.log(`postinstall warning: ${err.message}`);
    console.log('Cache not updated after retries.');
    exit(0);
  } else {
    console.log('postinstall succeeded');
    exit(0);
  }
});
