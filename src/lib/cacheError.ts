import path from 'path';

import { errorOperation, isAbsolute } from '../compat.ts';

type FsError = Error & { code?: string; path?: string; syscall?: string; cause?: unknown };

const FOLDER_CODES = ['EACCES', 'EPERM', 'EROFS', 'ENOTDIR', 'ENOENT'];
const FOLDER_OPERATIONS = ['mkdir', 'open'];

function within(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (relative.split(path.sep)[0] !== '..' && !isAbsolute(relative));
}

// Only when the cache folder itself refused the write: the cache folder, inside it, or a parent of
// it (mkdirp fails on ~/.node-semvers when home is read-only). Anything else, such as a rename
// error from a scanner holding a file, passes through as the same object.
export default function cacheError(err: Error, cachePath: string, home: string): Error {
  const raw = err as FsError;
  if (!raw || FOLDER_CODES.indexOf(raw.code || '') < 0) return err;
  const operation = errorOperation(raw);
  if (FOLDER_OPERATIONS.indexOf(operation) < 0) return err;
  if (typeof raw.path !== 'string') return err;
  const errPath = path.resolve(raw.path);
  const folder = path.resolve(cachePath);
  // Windows reports a mkdir beneath a regular file as ENOENT, where POSIX says ENOTDIR, and then
  // fails opening the temp file inside the folder that was never made. Only writes reach here as
  // errors (a failed read falls through in fetch-json-cache), so an ENOENT open inside the folder is a write.
  if (raw.code === 'ENOENT' && operation === 'open' ? !within(folder, errPath) : !within(folder, errPath) && !within(errPath, folder)) return err;

  let message = `node-semvers: cannot write the cache folder ${cachePath} (${raw.code}: ${raw.message}). The home folder must be writable, or pass the cachePath option.`;
  if (raw.code === 'EACCES' || raw.code === 'EPERM') message += ` It may be owned by another user (for example after sudo); remove ${path.join(home, '.node-semvers')} to fix it.`;

  // cause is only kept by new Error(msg, { cause }) from Node 16.9, so every field is set by hand
  const result = new Error(message) as FsError;
  result.cause = err;
  result.code = raw.code;
  result.path = raw.path;
  return result;
}
