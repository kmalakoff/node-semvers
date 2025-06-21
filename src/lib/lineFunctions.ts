import type { Version } from '../types.ts';

export function even(version: Version): boolean {
  const major = version.major === 0 ? version.minor : version.major;
  return major % 2 === 0;
}

export function odd(version: Version): boolean {
  const major = version.major === 0 ? version.minor : version.major;
  return major % 2 === 1;
}
