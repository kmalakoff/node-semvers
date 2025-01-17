// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import path from 'path';
import url from 'url';
import cr from 'cr';
import spawn from 'cross-spawn-cb';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, '..', '..', 'bin', 'cli.cjs');
const INSTALLED_DIR = path.join(path.join(__dirname, '..', 'cache'));

function major(version) {
  const parts = version.substr(1).split('.');
  return parts[0] === '0' ? +parts[1] : +parts[0];
}

describe('cli', () => {
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

  describe('clean directory', () => {
    before((cb) => rimraf2(INSTALLED_DIR, { disableGlob: true }, cb.bind(null, null)));
    const now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));

    describe('happy path', () => {
      it('12.14.0', (done) => {
        spawn(CLI, ['12.14.0', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v12.14.0');
          done();
        });
      });

      it('v12.14.0', (done) => {
        spawn(CLI, ['v12.14.0', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v12.14.0');
          done();
        });
      });

      it('12.14', (done) => {
        spawn(CLI, ['12.14', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v12.14.1');
          done();
        });
      });

      it('v12.14', (done) => {
        spawn(CLI, ['v12.14', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v12.14.1');
          done();
        });
      });

      it('12', (done) => {
        spawn(CLI, ['12', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v12.16.3');
          done();
        });
      });

      it('v12', (done) => {
        spawn(CLI, ['v12', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v12.16.3');
          done();
        });
      });

      it('lts', (done) => {
        spawn(CLI, ['lts', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v14.2.0');
          done();
        });
      });

      it('lts/*', (done) => {
        spawn(CLI, ['lts/*', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v14.2.0');
          done();
        });
      });

      it('latest', (done) => {
        spawn(CLI, ['latest', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v13.14.0');
          done();
        });
      });

      it('stable', (done) => {
        spawn(CLI, ['stable', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = cr(res.stdout).split('versions:\n').pop().split('\n')[0];
          assert.equal(version, 'v14.2.0');
          done();
        });
      });

      it('stable (path: raw)', (done) => {
        spawn(CLI, ['stable', '--now', `${now.getTime()}`, '--path', 'raw'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const version = JSON.parse(cr(res.stdout).split('versions:\n').pop().split('\n')[0]);
          assert.equal(version.version, 'v14.2.0');
          done();
        });
      });
    });

    describe('happy path range', () => {
      it('10.x || >=12.0.0', (done) => {
        spawn(CLI, ['10.0.0 || ~12.0.0', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions, ['v10.0.0', 'v12.0.0']);
          done();
        });
      });

      it('>=0.6 (default)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 433);
          done();
        });
      });

      it('>=0.6 (lts)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'lts'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 116);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (even)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'even'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 302);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (odd)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'odd'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 131);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });

      it('>=0.6 (range major)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'major'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 18);
          done();
        });
      });

      it('>=0.6 (range major,lts)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'major,lts'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 5);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range major,even)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'major,even'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 10);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range major,odd)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'major,odd'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 8);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });

      it('>=0.6 (range minor)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 316);
          done();
        });
      });

      it('>=0.6 (range minor,lts)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor,lts'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 38);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range minor,even)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor,even'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 206);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range minor,odd)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'minor,odd'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 110);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        });
      });

      it('>=0.6 (range patch)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 433);
          done();
        });
      });

      it('>=0.6 (range patch,lts)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch,lts'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 116);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range patch,even)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch,even'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 302);
          for (let index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        });
      });

      it('>=0.6 (range patch,odd)', (done) => {
        spawn(CLI, ['>=0.6', '--now', `${now.getTime()}`, '--range', 'patch,odd'], { encoding: 'utf8' }, (err, res) => {
          if (err) return done(err.message);
          const versions = cr(res.stdout).split('versions:\n').pop().split('\n').slice(0, -1);
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
