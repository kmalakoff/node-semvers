import type { Schedule, ScheduleRaw } from '../types.ts';

export default function normalizeSchedule(name: string, raw: ScheduleRaw): Schedule {
  const schedule = {
    name,
    semver: name.slice(1),
    raw,
  } as unknown as Schedule;

  schedule.start = new Date(raw.start);
  schedule.end = new Date(raw.end);
  if (raw.codename) schedule.codename = raw.codename.toLowerCase();
  if (raw.lts) schedule.lts = new Date(raw.lts);
  if (raw.maintenance) schedule.maintenance = new Date(raw.maintenance);

  return schedule;
}
