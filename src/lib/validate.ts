import semver from 'semver';

import type { ScheduleRaw, ScheduleRawMap, VersionRaw } from '../types.ts';
import normalizeSchedule from './normalizeSchedule.ts';
import normalizeVersion from './normalizeVersion.ts';

function isObject(value: unknown): value is { [key: string]: unknown } {
  return !!value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]';
}

// A body stored in the home folder is read by every project on the machine, so reject what the
// reader would crash on or what is plainly not the list. Each entry goes through the reader's own
// parsing, so anything it accepts today is accepted here.
export function validateIndex(body: unknown): VersionRaw[] {
  if (Object.prototype.toString.call(body) !== '[object Array]' || (body as unknown[]).length === 0) throw new Error('not a non-empty version list');
  const list = body as unknown[];
  for (let index = 0; index < list.length; index++) {
    const entry = list[index];
    if (!isObject(entry) || typeof entry.version !== 'string' || entry.version.charAt(0) !== 'v') throw new Error(`version entry ${index} is not a version`);
    let valid: string | null = null;
    try {
      valid = semver.valid(normalizeVersion(entry as unknown as VersionRaw, []).semver);
    } catch (_) {
      valid = null;
    }
    if (!valid) throw new Error(`version entry ${index} is not a version: ${entry.version}`);
  }
  return list as VersionRaw[];
}

export function validateSchedule(body: unknown): ScheduleRawMap {
  if (!isObject(body)) throw new Error('not a schedule');
  let count = 0;
  for (const name in body) {
    count++;
    const line = body[name];
    if (!isObject(line)) throw new Error(`schedule line ${name} is not an object`);
    try {
      normalizeSchedule(name, line as unknown as ScheduleRaw);
    } catch (_) {
      throw new Error(`schedule line ${name} is malformed`);
    }
  }
  if (!count) throw new Error('empty schedule');
  return body as unknown as ScheduleRawMap;
}
