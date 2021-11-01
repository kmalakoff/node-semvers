var path = require('path');

module.exports = {
  CACHE_DIRECTORY: path.resolve(path.join(__dirname, '..', '.cache')),
  DISTS_URL: 'https://nodejs.org/dist/index.json',
  SCHEDULES_URL: 'https://cdn.jsdelivr.net/gh/nodejs/Release@main/schedule.json',
};
