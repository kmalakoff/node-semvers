#!/usr/bin/env node

/**
 * Refreshes the cache shipped in .cache.
 *
 * Usage: npm run build:cache
 *
 * Goes through NodeVersions.load so the seed is written by exactly the code path that runs at
 * runtime — same cache options, same transform, same on-disk format.
 */

import { CACHE_PATH } from '../dist/esm/constants.js';
import NodeVersions from '../dist/esm/NodeVersions.js';

await NodeVersions.load();
console.log(`Refreshed ${CACHE_PATH}`);
