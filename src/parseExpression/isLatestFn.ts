import type { Schedule } from '../types.ts';

export type Function = (item: Schedule) => boolean;

export default function isLatestFn(now: Date): Function {
  return function isLatest(item: Schedule): boolean {
    return now >= item.start && now <= item.end;
  };
}
