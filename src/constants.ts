import path from 'path';
import url from 'url';
import moduleRoot from 'module-root-sync';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);
const root = moduleRoot(__dirname);

export default {
  CACHE_PATH: path.resolve(path.join(root, '.cache')),
  DISTS_URL: 'https://nodejs.org/dist/index.json',
  SCHEDULES_URL: 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json',
};
