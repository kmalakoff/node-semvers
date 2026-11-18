/**
 * Compatibility Layer for Node.js 0.8+
 * Local to this package - contains only needed functions.
 */
import os from 'os';
import path from 'path';

export function homedir(): string {
  return typeof os.homedir === 'function' ? os.homedir() : require('homedir-polyfill')();
}

// path.isAbsolute exists from Node 0.11.2; the same rule by hand below that
export function isAbsolute(test: string): boolean {
  if (typeof path.isAbsolute === 'function') return path.isAbsolute(test);
  return process.platform === 'win32' ? /^([a-zA-Z]:)?[\\/]/.test(test) : test.charAt(0) === '/';
}

// err.syscall is set from Node 4; Node 0.8 and 0.10 only put the operation in the message ("EACCES, mkdir '<path>'")
export function errorOperation(err: { syscall?: string; message?: string }): string {
  if (err.syscall) return err.syscall;
  const match = /^[A-Z0-9_]+, (\w+)/.exec(err.message || '');
  return match ? match[1] : '';
}
