import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

// The shipped seed: written at build time by scripts/generate-cache.mjs and only ever read at run
// time, so loadSync works on a fresh install. Refreshes go to the home folder (lib/cacheFolders.ts).
export const CACHE_PATH = path.join(__dirname, '..', '..', '.cache');
export const DISTS_URL = 'https://nodejs.org/dist/index.json';
export const SCHEDULES_URL = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json';

// Names the stored shape (see the transform in lib/cacheOptions.ts). A refresh written by another
// installed version of this package is read from the same home folder, so a change of shape must
// move to a new folder name instead of editing this one.
export const CACHE_FORMAT = 'v1';
