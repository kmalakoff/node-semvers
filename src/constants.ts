import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

// Seeded at build time by scripts/generate-cache.mjs and shipped in the package, so loadSync works
// on a fresh install. Refreshed at runtime by fetch-json-cache's etag revalidation.
export const CACHE_PATH = path.join(__dirname, '..', '..', '.cache');
export const DISTS_URL = 'https://nodejs.org/dist/index.json';
export const SCHEDULES_URL = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json';
