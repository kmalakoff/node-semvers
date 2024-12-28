import Cache from 'fetch-json-cache';
import semver from 'semver';

import constants from './constants.js';
import { major, minor } from './lib/keyFunctions.js';
import { even, odd } from './lib/lineFunctions.js';
import match from './lib/match.js';
import normalizeSchedule from './lib/normalizeSchedule.js';
import normalizeVersion from './lib/normalizeVersion.js';
import parseExpression from './parseExpression/index.js';

import type { LoadError, LoadOptions, ResolveOptions, Schedule, ScheduleRaw, Version, VersionRaw } from './types.js';

export type LoadCallback = (error?: LoadError, semvers?: NodeVersions) => void;

export default class NodeVersions {
  versions: Version[];
  schedules: Schedule[];

  constructor(versions: VersionRaw[], schedule: ScheduleRaw[]) {
    if (!versions) throw new Error('Missing option: versions');
    if (!schedule) throw new Error('Missing option: schedule');

    this.schedules = [];
    for (const name in schedule) this.schedules.push(normalizeSchedule(name, schedule[name]));
    this.schedules = this.schedules.sort((a, b) => (semver.gt(semver.coerce(a.semver), semver.coerce(b.semver)) ? 1 : -1));

    this.versions = [];
    for (let index = 0; index < versions.length; index++) this.versions.push(normalizeVersion(versions[index], this.schedules));
    this.versions = this.versions.sort((a, b) => (semver.gt(a.semver, b.semver) ? -1 : 1));
  }

  static load(options?: LoadOptions | LoadCallback, callback?: LoadCallback): undefined | Promise<NodeVersions> {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }

    if (typeof callback === 'function') {
      options = options || {};

      const cache = new Cache((options as LoadOptions).cacheDirectory || constants.CACHE_DIRECTORY);
      cache.get(constants.DISTS_URL, (err, versions: VersionRaw[]) => {
        if (err) return callback(err);

        cache.get(constants.SCHEDULES_URL, (err, schedule: ScheduleRaw[]) => {
          err ? callback(err) : callback(null, new NodeVersions(versions, schedule));
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        NodeVersions.load(options, function loadCallback(err, NodeVersions) {
          err ? reject(err) : resolve(NodeVersions);
        });
      });
    }
  }

  static loadSync(options?: LoadOptions): NodeVersions | null {
    options = options || {};
    const cache = new Cache(options.cacheDirectory || constants.CACHE_DIRECTORY);
    const versions = cache.getSync(constants.DISTS_URL) as VersionRaw[];
    const schedule = cache.getSync(constants.SCHEDULES_URL) as ScheduleRaw[];
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
      let version = null;
      for (let index = 0; index < this.versions.length; index++) {
        const test = this.versions[index];
        if (options.now && options.now < test.date) continue;
        if (!match(test, query)) continue;
        version = test;
        break;
      }
      if (version) return version[path];
    }

    // filtered expression
    const range = options.range || '';
    const filters = { lts: !!~range.indexOf('lts'), key: undefined, line: undefined };
    filters.key = ~range.indexOf('major') ? major : ~range.indexOf('minor') ? minor : undefined;
    filters.line = ~range.indexOf('even') ? even : ~range.indexOf('odd') ? odd : undefined;

    const results = [];
    const founds = {};

    for (let index = 0; index < this.versions.length; index++) {
      const test = this.versions[index];
      if (options.now && options.now < test.date) continue;
      if (filters.lts && !test.lts) continue;
      if (filters.line && !filters.line(test)) continue;
      if (!semver.satisfies(test.semver, expression)) continue;
      if (filters.key) {
        if (founds[filters.key(test)]) continue;
        founds[filters.key(test)] = true;
      }
      results.unshift(test[path]);
    }
    return results;
  }
}
