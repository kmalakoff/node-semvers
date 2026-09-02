var findLast = require('lodash.findlast');

module.exports = function normalizeVersion(version, schedules) {
  var parts = version.version
    .substr(1)
    .split('.')
    .map(function (x) {
      return +x;
    });

  var normalized = {
    name: 'v' + parts.join('.'),
    version: parts[0] + '.' + parts[1] + '.' + parts[2],
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
    schedule: parts[0] !== 0 ? 'v' + parts[0] : 'v' + parts[0] + '.' + parts[1],
  };

  var schedule = findLast(schedules, function (x) {
    return x.name === normalized.schedule;
  });
  if (schedule && version.lts) normalized.codename = schedule.codename;
  return normalized;
};
