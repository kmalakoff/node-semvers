// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import NodeVersions, { type Version } from 'node-semvers';
import Pinkie from 'pinkie-promise';
import parseExpression from '../../src/parseExpression/index.ts';
import useCache from '../lib/cache.ts';

function major(version: string) {
  const parts = version.substr(1).split('.');
  return parts[0] === '0' ? +parts[1] : +parts[0];
}

describe('resolve', () => {
  const cachePath = useCache('resolve');
  (() => {
    // patch and restore promise
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();

  describe('load semvers', () => {
    let semvers: NodeVersions | undefined;

    before((callback) => {
      NodeVersions.load({ cachePath }, (err, _semvers) => {
        semvers = _semvers;
        callback(err);
      });
    });

    const now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));

    describe('happy path', () => {
      it('12.14.0', () => {
        const version = semvers?.resolve('12.14.0', { now });
        assert.equal(version, 'v12.14.0');
      });

      it('v12.14.0', () => {
        const version = semvers?.resolve('v12.14.0', { now });
        assert.equal(version, 'v12.14.0');
      });

      it('12.14', () => {
        const version = semvers?.resolve('12.14', { now });
        assert.equal(version, 'v12.14.1');
      });

      it('v12.14', () => {
        const version = semvers?.resolve('v12.14', { now });
        assert.equal(version, 'v12.14.1');
      });

      it('12.14', () => {
        const version = semvers?.resolve(12.14, { now });
        assert.equal(version, 'v12.14.1');
      });

      it('12', () => {
        const version = semvers?.resolve('12', { now });
        assert.equal(version, 'v12.16.3');
      });

      it('v12', () => {
        const version = semvers?.resolve('v12', { now });
        assert.equal(version, 'v12.16.3');
      });

      it('12 (number)', () => {
        const version = semvers?.resolve(12, { now });
        assert.equal(version, 'v12.16.3');
      });

      it('lts', () => {
        const version = semvers?.resolve('lts', { now });
        assert.equal(version, 'v12.16.3');
      });

      it('dubnium', () => {
        const version = semvers?.resolve('dubnium', { now });
        assert.equal(version, 'v10.20.1');
      });

      it('lts/*', () => {
        const version = semvers?.resolve('lts/*', { now });
        assert.equal(version, 'v12.16.3');
      });

      it('latest', () => {
        const version = semvers?.resolve('latest', { now });
        assert.equal(version, 'v14.2.0');
      });

      it('stable', () => {
        const version = semvers?.resolve('stable', { now });
        assert.equal(version, 'v12.16.3');
      });

      it('stable (raw)', () => {
        const version = semvers?.resolve('stable', { now, path: 'raw' });
        assert.equal((version as Version).version, 'v12.16.3');
      });

      it('promise', async () => {
        const semvers = await NodeVersions.load({ cachePath });
        const version = semvers?.resolve('lts/*', { now });
        assert.equal(version, 'v12.16.3');
      });
    });

    describe('happy path range', () => {
      it('10.x || >=12.0.0', () => {
        const versions = semvers?.resolve('10.0.0 || ~12.0.0', { now });
        assert.deepEqual(versions, ['v10.0.0', 'v12.0.0']);
      });

      it('>=0.6 (default)', () => {
        const versions = semvers?.resolve('>=0.6', { now });
        assert.equal((versions as string[]).length, 433);
      });

      it('>=0.6 (lts)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'lts' });
        assert.equal((versions as string[]).length, 116);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (even)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'even' });
        assert.equal((versions as string[]).length, 302);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (odd)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'odd' });
        assert.equal((versions as string[]).length, 131);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 1);
        }
      });

      it('>=0.6 (range major)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'major' });
        assert.equal((versions as string[]).length, 18);
      });

      it('>=0.6 (range major,lts)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'major,lts' });
        assert.equal((versions as string[]).length, 5);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range major,even)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'major,even' });
        assert.equal((versions as string[]).length, 10);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range major,odd)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'major,odd' });
        assert.equal((versions as string[]).length, 8);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 1);
        }
      });

      it('>=0.6 (range minor)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'minor' });
        assert.equal((versions as string[]).length, 316);
      });

      it('>=0.6 (range minor,lts)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'minor,lts' });
        assert.equal((versions as string[]).length, 38);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range minor,even)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'minor,even' });
        assert.equal((versions as string[]).length, 206);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range minor,odd)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'minor,odd' });
        assert.equal((versions as string[]).length, 110);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 1);
        }
      });

      it('>=0.6 (range patch)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'patch' });
        assert.equal((versions as string[]).length, 433);
      });

      it('>=0.6 (range patch,lts)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'patch,lts' });
        assert.equal((versions as string[]).length, 116);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range patch,even)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'patch,even' });
        assert.equal((versions as string[]).length, 302);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range patch,odd)', () => {
        const versions = semvers?.resolve('>=0.6', { now, range: 'patch,odd' });
        assert.equal((versions as string[]).length, 131);
        for (let index = 0; index < (versions as string[]).length; index++) {
          assert.ok(major((versions as string[])[index]) % 2 === 1);
        }
      });
    });

    describe('node 27 schedule (alpha releases, every line LTS)', () => {
      const ALPHAS = ['v27.0.0-alpha.0.1.0', 'v27.0.0-alpha.0.0.0'];
      const dates = ['2026-06-15', '2026-11-16', '2027-06-01', '2027-11-01'].map((d) => new Date(`${d}T00:00:00.000Z`));

      function noAlpha(value: unknown) {
        const list = Array.isArray(value) ? value : [value];
        for (let index = 0; index < list.length; index++) assert.ok(!~`${list[index]}`.indexOf('-'), `unexpected prerelease ${list[index]}`);
      }

      it('loads the live list containing alphas without NaN', () => {
        assert.ok(semvers);
        const versions = (semvers as NodeVersions).versions;
        for (let index = 0; index < ALPHAS.length; index++) assert.ok(versions.some((v) => v.version === ALPHAS[index]));
        for (let index = 0; index < versions.length; index++) {
          const v = versions[index];
          assert.ok(!Number.isNaN(v.major) && !Number.isNaN(v.minor) && !Number.isNaN(v.patch), v.version);
          assert.ok(!~v.semver.indexOf('NaN'), v.version);
        }
        const alpha = versions.filter((v) => v.version === 'v27.0.0-alpha.0.1.0')[0];
        assert.equal(alpha.semver, '27.0.0-alpha.0.1.0');
        assert.equal(alpha.major, 27);
        assert.equal(alpha.patch, 0);
      });

      it('accepts the alpha field in the schedule', () => {
        const schedule = (semvers as NodeVersions).schedules.filter((s) => s.name === 'v27')[0];
        assert.equal(schedule.alpha?.toISOString().slice(0, 10), '2026-10-28');
        assert.equal(schedule.lts?.toISOString().slice(0, 10), '2027-10-20');
      });

      it('selects an alpha only by its exact version string', () => {
        const now = dates[1];
        assert.deepEqual(semvers?.resolve('v27.0.0-alpha.0.1.0', { now }), ['v27.0.0-alpha.0.1.0']);
        assert.deepEqual(semvers?.resolve('27.0.0-alpha.0.0.0', { now }), ['v27.0.0-alpha.0.0.0']);
      });

      it('ranges exclude alphas', () => {
        for (let index = 0; index < dates.length; index++) {
          const versions = semvers?.resolve('>=20', { now: dates[index] }) as string[];
          assert.ok(versions.length > 0);
          noAlpha(versions);
          noAlpha(semvers?.resolve('>=20', { now: dates[index], range: 'major' }));
        }
        noAlpha(semvers?.resolve('>=20'));
      });

      it('27 does not resolve to an alpha', () => {
        for (let index = 0; index < dates.length; index++) {
          noAlpha(semvers?.resolve('27', { now: dates[index] }));
          noAlpha(semvers?.resolve('27.0.0', { now: dates[index] }));
        }
      });

      it('lts and latest never resolve to an alpha', () => {
        for (let index = 0; index < dates.length; index++) {
          for (const expression of ['lts', 'latest', 'lts/*', 'stable']) noAlpha(semvers?.resolve(expression, { now: dates[index] }));
        }
        noAlpha(semvers?.resolve('lts'));
        noAlpha(semvers?.resolve('latest'));
      });

      it('lts is the newest line with lts <= now <= end', () => {
        assert.equal(semvers?.resolve('lts', { now: dates[0] }), 'v24.16.0');
        assert.equal(semvers?.resolve('lts', { now: dates[1] }), 'v26.13.1');
      });

      it('latest is the newest line with start <= now <= end, regardless of lts', () => {
        assert.equal(semvers?.resolve('latest', { now: dates[0] }), 'v26.3.0');
        assert.equal(semvers?.resolve('latest', { now: dates[1] }), 'v26.13.1');
      });

      it('latest and lts select the line from the schedule dates', () => {
        const schedules = (semvers as NodeVersions).schedules;
        const line = (expression: string, now: Date) => (parseExpression.call({ schedules }, expression, now) as { name: string } | null)?.name;
        assert.equal(line('latest', dates[2]), 'v27');
        assert.equal(line('lts', dates[2]), 'v26');
        assert.equal(line('latest', dates[3]), 'v27');
        assert.equal(line('lts', dates[3]), 'v27');
      });

      it('even and odd stay literal parity', () => {
        const odd = semvers?.resolve('>=20', { now: dates[1], range: 'odd,major' }) as string[];
        const even = semvers?.resolve('>=20', { now: dates[1], range: 'even,major' }) as string[];
        assert.deepEqual(odd, ['v21.7.3', 'v23.11.1', 'v25.9.0']);
        assert.deepEqual(
          even.slice(0, 3).map((v) => v.split('.')[0]),
          ['v20', 'v22', 'v24']
        );
      });
    });

    describe('unhappy path', () => {
      it('null', () => {
        const version = semvers?.resolve(null as unknown as string, { now });
        assert.ok(!version);
      });

      it('undefined', () => {
        const version = semvers?.resolve(undefined as unknown as string, { now });
        assert.ok(!version);
      });

      it('date', () => {
        const version = semvers?.resolve(new Date(), { now });
        assert.ok(!version);
      });
    });
  });
});
