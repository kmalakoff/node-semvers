var assert = require('assert');
var path = require('path');
var rimraf = require('rimraf');

var NodeVersions = require('../..');

function major(version) {
  var parts = version.substr(1).split('.');
  return parts[0] === '0' ? +parts[1] : +parts[0];
}

var INSTALLED_DIR = path.resolve(path.join(__dirname, '..', 'cache'));

describe('resolve', function () {
  var now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));
  var semvers = null;

  before(function (callback) {
    rimraf(INSTALLED_DIR, function () {
      NodeVersions.load(function (err, _semvers) {
        semvers = _semvers;
        callback(err);
      });
    });
  });

  describe('happy path', function () {
    it('12.14.0', function () {
      var version = semvers.resolve('12.14.0', { now: now });
      assert.equal(version, 'v12.14.0');
    });

    it('v12.14.0', function () {
      var version = semvers.resolve('v12.14.0', { now: now });
      assert.equal(version, 'v12.14.0');
    });

    it('12.14', function () {
      var version = semvers.resolve('12.14', { now: now });
      assert.equal(version, 'v12.14.1');
    });

    it('v12.14', function () {
      var version = semvers.resolve('v12.14', { now: now });
      assert.equal(version, 'v12.14.1');
    });

    it('12.14', function () {
      var version = semvers.resolve(12.14, { now: now });
      assert.equal(version, 'v12.14.1');
    });

    it('12', function () {
      var version = semvers.resolve('12', { now: now });
      assert.equal(version, 'v12.16.3');
    });

    it('v12', function () {
      var version = semvers.resolve('v12', { now: now });
      assert.equal(version, 'v12.16.3');
    });

    it('12 (number)', function () {
      var version = semvers.resolve(12, { now: now });
      assert.equal(version, 'v12.16.3');
    });

    it('lts', function () {
      var version = semvers.resolve('lts', { now: now });
      assert.equal(version, 'v14.2.0');
    });

    it('lts/dubnium', function () {
      var version = semvers.resolve('lts/dubnium', { now: now });
      assert.equal(version, 'v10.20.1');
    });

    it('dubnium', function () {
      var version = semvers.resolve('dubnium', { now: now });
      assert.equal(version, 'v10.20.1');
    });

    it('lts/*', function () {
      var version = semvers.resolve('lts/*', { now: now });
      assert.equal(version, 'v14.2.0');
    });

    it('latest', function () {
      var version = semvers.resolve('latest', { now: now });
      assert.equal(version, 'v13.14.0');
    });

    it('stable', function () {
      var version = semvers.resolve('stable', { now: now });
      assert.equal(version, 'v14.2.0');
    });

    it('stable (raw)', function () {
      var version = semvers.resolve('stable', { now: now, path: 'raw' });
      assert.equal(version.version, 'v14.2.0');
    });

    it('promise', function (done) {
      if (typeof Promise === 'undefined') return done(); // no promise support

      NodeVersions.load()
        .then(function (semvers) {
          var version = semvers.resolve('lts/*', { now: now });
          assert.equal(version, 'v14.2.0');
          done();
        })
        .catch(done);
    });
  });

  describe('happy path range', function () {
    it('10.x || >=12.0.0', function () {
      var versions = semvers.resolve('10.0.0 || ~12.0.0', { now: now });
      assert.deepEqual(versions, ['v10.0.0', 'v12.0.0']);
    });

    it('>=0.6 (default)', function () {
      var versions = semvers.resolve('>=0.6', { now: now });
      assert.equal(versions.length, 433);
    });

    it('>=0.6 (lts)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'lts' });
      assert.equal(versions.length, 116);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (even)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'even' });
      assert.equal(versions.length, 302);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (odd)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'odd' });
      assert.equal(versions.length, 131);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 1);
      }
    });

    it('>=0.6 (range major)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'major' });
      assert.equal(versions.length, 18);
    });

    it('>=0.6 (range major,lts)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'major,lts' });
      assert.equal(versions.length, 5);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (range major,even)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'major,even' });
      assert.equal(versions.length, 10);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (range major,odd)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'major,odd' });
      assert.equal(versions.length, 8);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 1);
      }
    });

    it('>=0.6 (range minor)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'minor' });
      assert.equal(versions.length, 316);
    });

    it('>=0.6 (range minor,lts)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'minor,lts' });
      assert.equal(versions.length, 38);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (range minor,even)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'minor,even' });
      assert.equal(versions.length, 206);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (range minor,odd)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'minor,odd' });
      assert.equal(versions.length, 110);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 1);
      }
    });

    it('>=0.6 (range patch)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'patch' });
      assert.equal(versions.length, 433);
    });

    it('>=0.6 (range patch,lts)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'patch,lts' });
      assert.equal(versions.length, 116);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (range patch,even)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'patch,even' });
      assert.equal(versions.length, 302);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 0);
      }
    });

    it('>=0.6 (range patch,odd)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'patch,odd' });
      assert.equal(versions.length, 131);
      for (var index = 0; index < versions.length; index++) {
        assert.ok(major(versions[index]) % 2 === 1);
      }
    });
  });

  describe('unhappy path', function () {
    it('null', function () {
      var version = semvers.resolve(null, { now: now });
      assert.ok(!version);
    });

    it('undefined', function () {
      var version = semvers.resolve(undefined, { now: now });
      assert.ok(!version);
    });

    it('date', function () {
      var version = semvers.resolve(new Date(), { now: now });
      assert.ok(!version);
    });
  });
});
