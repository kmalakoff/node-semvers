import type { Version } from '../types.ts';

export function major(version: Version): string {
  return version.major === 0 ? `${version.major}.${version.minor}` : `${version.major}`;
}

export function minor(version: Version): string {
  return version.major === 0 ? `${version.major}.${version.minor}.${version.patch}` : `${version.major}.${version.minor}`;
}
