import schedulesForEach from './schedulesForEach.js';

export default function schedulesLatest(schedules, filter) {
  let latest = null;
  schedulesForEach(schedules, filter, (schedule) => {
    if (!latest || latest.start < schedule.start) latest = schedule;
  });
  return latest;
}
