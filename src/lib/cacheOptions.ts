import type { CacheOptions } from 'fetch-json-cache';

import { DISTS_URL } from '../constants.ts';
import type { ScheduleRawMap, VersionRaw } from '../types.ts';
import { validateIndex, validateSchedule } from './validate.ts';

type Wire = VersionRaw[] | ScheduleRawMap;

// Only these fields are read, and the cache ships in the package, so store nothing else. A throwing
// transform is an error with nothing stored, which is how a body that is not the list is kept out.
export default function cacheOptions(seedPath?: string): CacheOptions<Wire, Wire> {
  return {
    seedPath,
    transform: (body, endpoint) => (endpoint === DISTS_URL ? validateIndex(body).map(({ version, date, lts }) => ({ version, date, lts })) : validateSchedule(body)),
  };
}
