import path from 'path';

import { isAbsolute } from '../compat.ts';
import { CACHE_FORMAT, CACHE_PATH } from '../constants.ts';

export interface CacheFolders {
  cachePath: string;
  seedPath?: string;
  home?: string;
  // set when there is no usable home folder: cachePath is then the seed, which is only read
  error?: Error;
}

// `home` is passed in so tests never touch the real home folder; NodeVersions passes homedir().
export default function cacheFolders(cachePath: string | undefined, home: string | null | undefined): CacheFolders {
  if (cachePath) return { cachePath };

  if (typeof home !== 'string' || !home || !isAbsolute(home)) return { cachePath: CACHE_PATH, error: new Error(`node-semvers: no usable home folder ("${home || ''}"); pass the cachePath option`) };
  return { cachePath: path.join(home, '.node-semvers', 'cache', CACHE_FORMAT), seedPath: CACHE_PATH, home };
}
