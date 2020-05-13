var find = require('lodash.find');

module.exports = function normalizeVersion(raw, schedules) {
  var parts = raw.version.substr(1).split('.');

  var version = {
    version: raw.version,
    name: parts[0] !== 0 ? 'v' + +parts[0] : 'v' + +parts[0] + '.' + +parts[1],
    semver: parts[0] + '.' + +parts[1] + '.' + +parts[2],
    major: +parts[0],
    minor: +parts[1],
    patch: +parts[2],
    lts: raw.lts,
    raw: raw,
  };

  var schedule = find(schedules, function (x) {
    return x.name === version.name;
  });
  if (schedule && raw.lts) version.codename = schedule.codename;
  return version;
};
