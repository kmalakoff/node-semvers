export default function schedulesForEach(schedules, filter, fn) {
  for (let index = 0; index < schedules.length; index++) {
    const schedule = schedules[index];
    !filter(schedule) || fn(schedule);
  }
}
