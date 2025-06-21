import type { Schedule } from '../types.ts';

export type Function = (item: Schedule) => boolean;

export default function isLTSFn(now: Date): Function {
  return function isLTS(item: Schedule): boolean {
    return item.lts && now >= item.start && now <= item.end;
  };
}
