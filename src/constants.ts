import path from 'path';
import url from 'url';

import packageRoot from './lib/packageRoot.js';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const root = packageRoot(__dirname, 'node-semvers');

export default {
  CACHE_DIRECTORY: path.resolve(path.join(root, '.cache')),
  DISTS_URL: 'https://nodejs.org/dist/index.json',
  SCHEDULES_URL: 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json',
};
