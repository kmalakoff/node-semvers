import schedulesForEach from './schedulesForEach.ts';

export default function schedulesLatest(schedules, filter) {
  let latest = null;
  schedulesForEach(schedules, filter, (schedule) => {
    if (!latest || latest.start < schedule.start) latest = schedule;
  });
  return latest;
}
