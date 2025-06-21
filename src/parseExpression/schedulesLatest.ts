import type { Schedule } from '../types.ts';

export type Filter = (item: Schedule) => boolean;

export default function schedulesLatest(schedules: Schedule[], filter: Filter): Schedule {
  let latest = null;
  for (let index = 0; index < schedules.length; index++) {
    const schedule = schedules[index];
    if (!filter(schedule)) continue;
    if (!latest || latest.start < schedule.start) latest = schedule;
  }
  return latest;
}
