import type { Schedule, Version, VersionRaw } from '../types.ts';

export default function normalizeVersion(raw: VersionRaw, schedules: Schedule[]): Version {
  const parts = raw.version.substr(1).split('.');

  const version = {
    version: raw.version,
    name: parts[0] !== '0' ? `v${+parts[0]}` : `v${+parts[0]}.${+parts[1]}`,
    semver: `${parts[0]}.${+parts[1]}.${+parts[2]}`,
    major: +parts[0],
    minor: +parts[1],
    patch: +parts[2],
    lts: raw.lts,
    date: new Date(raw.date),
    raw: raw,
  } as Version;

  let schedule = null;
  for (let index = 0; index < schedules.length; index++) {
    const test = schedules[index];
    if (test.name === version.name) {
      schedule = test;
      break;
    }
  }
  if (schedule && raw.lts) version.codename = schedule.codename;
  return version;
}
