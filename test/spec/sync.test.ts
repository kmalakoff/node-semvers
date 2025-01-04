// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import path from 'path';
import url from 'url';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';

// @ts-ignore
import NodeVersions, { type Version } from 'node-semvers';

function major(version) {
  const parts = version.substr(1).split('.');
  return parts[0] === '0' ? +parts[1] : +parts[0];
}

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const INSTALLED_DIR = path.join(path.join(__dirname, '..', 'cache'));

describe('sync', () => {
  (() => {
    // patch and restore promise
    // @ts-ignore
    let rootPromise: Promise;
    before(() => {
      rootPromise = global.Promise;
      // @ts-ignore
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = rootPromise;
    });
  })();

  describe('load semvers', () => {
    before((callback) => {
      rimraf2(INSTALLED_DIR, { disableGlob: true }, () => {
        NodeVersions.load(callback);
      });
    });
    const now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));

    describe('happy path', () => {
      it('12.14.0', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('12.14.0', { now: now });
        assert.equal(version, 'v12.14.0');
      });

      it('v12.14.0', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('v12.14.0', { now: now });
        assert.equal(version, 'v12.14.0');
      });

      it('12.14', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('12.14', { now: now });
        assert.equal(version, 'v12.14.1');
      });

      it('v12.14', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('v12.14', { now: now });
        assert.equal(version, 'v12.14.1');
      });

      it('12.14', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve(12.14, { now: now });
        assert.equal(version, 'v12.14.1');
      });

      it('12', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('12', { now: now });
        assert.equal(version, 'v12.16.3');
      });

      it('v12', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('v12', { now: now });
        assert.equal(version, 'v12.16.3');
      });

      it('12 (number)', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve(12, { now: now });
        assert.equal(version, 'v12.16.3');
      });

      it('lts', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('lts', { now: now });
        assert.equal(version, 'v14.2.0');
      });

      it('lts/dubnium', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('lts/dubnium', { now: now });
        assert.equal(version, 'v10.20.1');
      });

      it('dubnium', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('dubnium', { now: now });
        assert.equal(version, 'v10.20.1');
      });

      it('lts/*', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('lts/*', { now: now });
        assert.equal(version, 'v14.2.0');
      });

      it('latest', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('latest', { now: now });
        assert.equal(version, 'v13.14.0');
      });

      it('stable', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('stable', { now: now });
        assert.equal(version, 'v14.2.0');
      });

      it('stable (raw)', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve('stable', { now: now, path: 'raw' });
        assert.equal((version as Version).version, 'v14.2.0');
      });
    });

    describe('happy path range', () => {
      it('10.x || >=12.0.0', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('10.0.0 || ~12.0.0', { now: now });
        assert.deepEqual(versions, ['v10.0.0', 'v12.0.0']);
      });

      it('>=0.6 (default)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now });
        assert.equal((versions as Version[]).length, 433);
      });

      it('>=0.6 (lts)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'lts' });
        assert.equal((versions as Version[]).length, 116);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (even)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'even' });
        assert.equal((versions as Version[]).length, 302);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (odd)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'odd' });
        assert.equal((versions as Version[]).length, 131);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 1);
        }
      });

      it('>=0.6 (range major)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'major' });
        assert.equal((versions as Version[]).length, 18);
      });

      it('>=0.6 (range major,lts)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'major,lts' });
        assert.equal((versions as Version[]).length, 5);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range major,even)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'major,even' });
        assert.equal((versions as Version[]).length, 10);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range major,odd)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'major,odd' });
        assert.equal((versions as Version[]).length, 8);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 1);
        }
      });

      it('>=0.6 (range minor)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'minor' });
        assert.equal((versions as Version[]).length, 316);
      });

      it('>=0.6 (range minor,lts)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'minor,lts' });
        assert.equal((versions as Version[]).length, 38);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range minor,even)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'minor,even' });
        assert.equal((versions as Version[]).length, 206);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range minor,odd)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'minor,odd' });
        assert.equal((versions as Version[]).length, 110);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 1);
        }
      });

      it('>=0.6 (range patch)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'patch' });
        assert.equal((versions as Version[]).length, 433);
      });

      it('>=0.6 (range patch,lts)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'patch,lts' });
        assert.equal((versions as Version[]).length, 116);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range patch,even)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'patch,even' });
        assert.equal((versions as Version[]).length, 302);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 0);
        }
      });

      it('>=0.6 (range patch,odd)', () => {
        const semvers = NodeVersions.loadSync();
        const versions = semvers.resolve('>=0.6', { now: now, range: 'patch,odd' });
        assert.equal((versions as Version[]).length, 131);
        for (let index = 0; index < (versions as Version[]).length; index++) {
          assert.ok(major(versions[index]) % 2 === 1);
        }
      });
    });

    describe('unhappy path', () => {
      it('null', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve(null, { now: now });
        assert.ok(!version);
      });

      it('undefined', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve(undefined, { now: now });
        assert.ok(!version);
      });

      it('date', () => {
        const semvers = NodeVersions.loadSync();
        const version = semvers.resolve(new Date(), { now: now });
        assert.ok(!version);
      });
    });
  });
});
