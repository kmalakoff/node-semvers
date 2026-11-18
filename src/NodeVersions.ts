import Cache from 'fetch-json-cache';
import semver from 'semver';

import { homedir } from './compat.ts';
import { DISTS_URL, SCHEDULES_URL } from './constants.ts';
import cacheError from './lib/cacheError.ts';
import cacheFolders, { type CacheFolders } from './lib/cacheFolders.ts';
import cacheOptions from './lib/cacheOptions.ts';
import { major, minor } from './lib/keyFunctions.ts';
import { even, odd } from './lib/lineFunctions.ts';
import match from './lib/match.ts';
import normalizeSchedule from './lib/normalizeSchedule.ts';
import normalizeVersion from './lib/normalizeVersion.ts';
import parseExpression from './parseExpression/index.ts';

import type { LoadError, LoadOptions, ResolveOptions, Schedule, ScheduleRawMap, Version, VersionRaw } from './types.ts';

export type LoadCallback = (error?: LoadError, semvers?: NodeVersions) => void;

// Resolved per call, never at import, so requiring this package can never fail on it
function folders(options: LoadOptions): CacheFolders {
  let home: string | null = null;
  if (!options.cachePath) {
    try {
      home = homedir();
    } catch (_) {
      home = null;
    }
  }
  return cacheFolders(options.cachePath, home);
}

export default class NodeVersions {
  versions: Version[];
  schedules: Schedule[];

  constructor(versions: VersionRaw[], schedule: ScheduleRawMap) {
    if (!versions) throw new Error('Missing option: versions');
    if (!schedule) throw new Error('Missing option: schedule');

    this.schedules = [];
    for (const name in schedule) this.schedules.push(normalizeSchedule(name, schedule[name]));
    this.schedules = this.schedules.sort((a, b) => (semver.gt(semver.coerce(a.semver)?.version ?? '0.0.0', semver.coerce(b.semver)?.version ?? '0.0.0') ? 1 : -1));

    this.versions = [];
    for (let index = 0; index < versions.length; index++) this.versions.push(normalizeVersion(versions[index], this.schedules));
    this.versions = this.versions.sort((a, b) => (semver.gt(a.semver, b.semver) ? -1 : 1));
  }

  static load(callback: LoadCallback): void;
  static load(options: LoadOptions, callback: LoadCallback): void;
  static load(options?: LoadOptions): Promise<NodeVersions>;
  static load(options?: LoadOptions | LoadCallback, callback?: LoadCallback): void | Promise<NodeVersions> {
    callback = typeof options === 'function' ? options : callback;
    options = typeof options === 'function' ? {} : ((options || {}) as LoadOptions);

    function worker(options: LoadOptions, callback: LoadCallback) {
      const where = folders(options);
      if (where.error) return callback(where.error);

      const fail = (err: Error): LoadError => (where.home ? (cacheError(err, where.cachePath, where.home) as LoadError) : (err as LoadError));
      const cache = new Cache(where.cachePath, cacheOptions(where.seedPath));
      cache.get<VersionRaw[]>(DISTS_URL, (err, versions) => {
        if (err) return callback(fail(err));

        cache.get<ScheduleRawMap>(SCHEDULES_URL, (err, schedule) => {
          if (err) return callback(fail(err));
          if (!versions || !schedule) return callback(new Error('Missing data'));
          callback(undefined, new NodeVersions(versions, schedule));
        });
      });
    }

    if (typeof callback === 'function') return worker(options, callback);
    return new Promise((resolve, reject) =>
      worker(options, (err?: LoadError, versions?: NodeVersions) => {
        if (err || !versions) return reject(err ?? new Error('No versions returned'));
        resolve(versions);
      })
    );
  }

  static loadSync(options?: LoadOptions): NodeVersions | null {
    // With no usable home this reads the shipped seed, which a fresh offline install needs
    const where = folders(options || {});
    const cache = new Cache(where.cachePath, cacheOptions(where.seedPath));
    const versions = cache.getSync<VersionRaw[]>(DISTS_URL);
    const schedule = cache.getSync<ScheduleRawMap>(SCHEDULES_URL);
    if (!versions || !schedule) return null;
    return new NodeVersions(versions, schedule);
  }

  resolve(expression: string | number | Date, options?: ResolveOptions): string | string[] | Version | Version[] | null {
    options = options || {};
    const path = options.path || 'version';

    // normalize
    if (typeof expression === 'number') expression = `${expression}`;
    if (typeof expression !== 'string') return null;
    expression = expression.trim();

    // single result, try a match
    const query = parseExpression.call(this, expression, options.now || new Date());
    if (query) {
      let version: Version | null = null;
      for (let index = 0; index < this.versions.length; index++) {
        const test = this.versions[index];
        if (options.now && options.now < test.date) continue;
        if (~test.semver.indexOf('-')) continue; // alphas are never chosen implicitly
        if (!match(test as unknown as Record<string, unknown>, query as unknown as Record<string, unknown>)) continue;
        version = test;
        break;
      }
      if (version) return (version as unknown as Record<string, unknown>)[path] as string | Version;
    }

    // filtered expression
    const range = options.range || '';
    const filters: { lts: boolean; key: ((v: Version) => string) | undefined; line: ((v: Version) => boolean) | undefined } = {
      lts: !!~range.indexOf('lts'),
      key: undefined,
      line: undefined,
    };
    filters.key = ~range.indexOf('major') ? major : ~range.indexOf('minor') ? minor : undefined;
    filters.line = ~range.indexOf('even') ? even : ~range.indexOf('odd') ? odd : undefined;

    const results: unknown[] = [];
    const founds: Record<string, boolean> = {};

    for (let index = 0; index < this.versions.length; index++) {
      const test = this.versions[index];
      if (options.now && options.now < test.date) continue;
      if (filters.lts && !test.lts) continue;
      if (filters.line && !filters.line(test)) continue;
      if (!semver.satisfies(test.semver, expression)) continue;
      if (filters.key) {
        const k = filters.key(test);
        if (founds[k]) continue;
        founds[k] = true;
      }
      results.unshift((test as unknown as Record<string, unknown>)[path]);
    }
    return results as string[];
  }
}
