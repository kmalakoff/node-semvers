module.exports = function normalizeSchedule(name, schedule) {
  var normalized = {
    name: name,
    version: name.substr(1),
  };

  normalized.start = new Date(schedule.start);
  normalized.end = new Date(schedule.end);
  if (schedule.codename) normalized.codename = schedule.codename.toLowerCase();
  if (schedule.lts) normalized.lts = new Date(schedule.lts);
  if (schedule.maintenance) normalized.maintenance = new Date(schedule.maintenance);

  return normalized;
};
