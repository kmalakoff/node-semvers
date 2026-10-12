// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import NodeVersions, { type Version } from 'node-semvers';
import Pinkie from 'pinkie-promise';
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
        assert.equal(version, 'v14.2.0');
      });

      it('dubnium', () => {
        const version = semvers?.resolve('dubnium', { now });
        assert.equal(version, 'v10.20.1');
      });

      it('lts/*', () => {
        const version = semvers?.resolve('lts/*', { now });
        assert.equal(version, 'v14.2.0');
      });

      it('latest', () => {
        const version = semvers?.resolve('latest', { now });
        assert.equal(version, 'v13.14.0');
      });

      it('stable', () => {
        const version = semvers?.resolve('stable', { now });
        assert.equal(version, 'v14.2.0');
      });

      it('stable (raw)', () => {
        const version = semvers?.resolve('stable', { now, path: 'raw' });
        assert.equal((version as Version).version, 'v14.2.0');
      });

      it('promise', async () => {
        const semvers = await NodeVersions.load({ cachePath });
        const version = semvers?.resolve('lts/*', { now });
        assert.equal(version, 'v14.2.0');
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
