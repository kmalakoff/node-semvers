// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import cr from 'cr';
import spawn, { type SpawnCallback } from 'cross-spawn-cb';
import fs from 'fs';
import path from 'path';
import Pinkie from 'pinkie-promise';
import url from 'url';
import useCache from '../lib/cache.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.cjs');
const PKG_VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')).version;

function major(version: string) {
  const parts = version.substr(1).split('.');
  return parts[0] === '0' ? +parts[1] : +parts[0];
}

describe('cli', () => {
  const cachePath = useCache('cli');

  function run(argv: string[], callback: SpawnCallback) {
    return spawn(CLI, ['--cachePath', cachePath].concat(argv), { encoding: 'utf8' }, callback);
  }

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

  describe('version and help', () => {
    it('--version', (done) => {
      run(['--version'], (err, res) => {
        if (err) return done(err);
        const output = cr((res?.stdout ?? '') as string).trim();
        assert.equal(output, PKG_VERSION);
        done();
      });
    });

    it('-v', (done) => {
      run(['-v'], (err, res) => {
        if (err) return done(err);
        const output = cr((res?.stdout ?? '') as string).trim();
        assert.equal(output, PKG_VERSION);
        done();
      });
    });

    it('--help', (done) => {
      run(['--help'], (err, res) => {
        if (err) return done(err);
        const output = cr((res?.stdout ?? '') as string);
        assert.ok(output.indexOf('Usage:') >= 0);
        assert.ok(output.indexOf('Version Strings:') >= 0);
        assert.ok(output.indexOf('--version') >= 0);
        assert.ok(output.indexOf('--help') >= 0);
        done();
      });
    });

    it('-h', (done) => {
      run(['-h'], (err, res) => {
        if (err) return done(err);
        const output = cr((res?.stdout ?? '') as string);
        assert.ok(output.indexOf('Usage:') >= 0);
        assert.ok(output.indexOf('Version Strings:') >= 0);
        done();
      });
    });
  });

  describe('clean directory', () => {
    const now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));

    describe('happy path', () => {
      it('12.14.0', (done) => {
        run(['12.14.0', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v12.14.0');
          done();
        });
      });

      it('v12.14.0', (done) => {
        run(['v12.14.0', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v12.14.0');
          done();
        });
      });

      it('12.14', (done) => {
        run(['12.14', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v12.14.1');
          done();
        });
      });

      it('v12.14', (done) => {
        run(['v12.14', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v12.14.1');
          done();
        });
      });

      it('12', (done) => {
        run(['12', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v12.16.3');
          done();
        });
      });

      it('v12', (done) => {
        run(['v12', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v12.16.3');
          done();
        });
      });

      it('lts', (done) => {
        run(['lts', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v14.2.0');
          done();
        });
      });

      it('lts/*', (done) => {
        run(['lts/*', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v14.2.0');
          done();
        });
      });

      it('latest', (done) => {
        run(['latest', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v13.14.0');
          done();
        });
      });

      it('stable', (done) => {
        run(['stable', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const version = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          ).split('\n')[0];
          assert.equal(version, 'v14.2.0');
          done();
        });
      });

      it('stable (path: raw)', (done) => {
        run(['stable', '--now', `${now.getTime()}`, '--path', 'raw'], (err, res) => {
          if (err) return done(err);

          const version = JSON.parse(
            (
              cr((res?.stdout ?? '') as string)
                .split('versions:\n')
                .pop() ?? ''
            ).split('\n')[0]
          );
          assert.equal(version.version, 'v14.2.0');
          done();
        });
      });
    });

    describe('happy path range', () => {
      it('10.x || >=12.0.0', (done) => {
        run(['10.0.0 || ~12.0.0', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions, ['v10.0.0', 'v12.0.0']);
          done();
        });
      });

      it('>=0.6 (default)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 433);
          done();
        });
      });

      it('>=0.6 (lts)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'lts'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 116);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (even)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'even'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 302);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (odd)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'odd'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 131);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });

      it('>=0.6 (range major)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'major'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 18);
          done();
        });
      });

      it('>=0.6 (range major,lts)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'major,lts'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 5);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range major,even)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'major,even'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 10);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range major,odd)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'major,odd'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 8);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });

      it('>=0.6 (range minor)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 316);
          done();
        });
      });

      it('>=0.6 (range minor,lts)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor,lts'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 38);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range minor,even)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor,even'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 206);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range minor,odd)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor,odd'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 110);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });

      it('>=0.6 (range patch)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 433);
          done();
        });
      });

      it('>=0.6 (range patch,lts)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch,lts'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 116);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range patch,even)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch,even'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 302);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range patch,odd)', (done) => {
        run(['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch,odd'], (err, res) => {
          if (err) return done(err);

          const versions = (
            cr((res?.stdout ?? '') as string)
              .split('versions:\n')
              .pop() ?? ''
          )
            .split('\n')
            .slice(0, -1);
          assert.deepEqual(versions.length, 131);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });
    });
  });
});
