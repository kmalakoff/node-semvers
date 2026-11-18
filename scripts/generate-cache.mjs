#!/usr/bin/env node

/**
 * Refreshes the seed shipped in .cache.
 *
 * Usage: npm run build:cache
 *
 * This is the only place the seed is written; at run time it is only read. It goes through
 * NodeVersions.load with an explicit cachePath, so the seed is written by the code path that
 * writes at run time (same transform, same on-disk format), then checks each stored etag against
 * the server's. The check matters offline, where load quietly returns what is already there.
 */

import Cache from 'fetch-json-cache';
import fs from 'fs';
import { head } from 'get-file-compat';
import path from 'path';
import { CACHE_PATH, DISTS_URL, SCHEDULES_URL } from '../dist/esm/constants.js';
import NodeVersions from '../dist/esm/NodeVersions.js';

await NodeVersions.load({ cachePath: CACHE_PATH });

// the record's file name comes from fetch-json-cache, which owns the key
const { hash } = new Cache(CACHE_PATH).options;
let failed = false;
for (const endpoint of [DISTS_URL, SCHEDULES_URL]) {
  const file = path.join(CACHE_PATH, `${hash(endpoint)}.json`);
  const stored = JSON.parse(fs.readFileSync(file, 'utf8')).headers.etag;
  try {
    // get-file-compat, not fetch: fetch asks for compressed responses and gets a different etag
    const { headers } = await head(endpoint);
    if (headers.etag !== stored) throw new Error(`stored etag ${stored} differs from the server's ${headers.etag}`);
    console.log(`Confirmed ${endpoint} ${stored}`);
  } catch (err) {
    console.error(`${endpoint}: ${err.message}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`Refreshed ${CACHE_PATH}`);
