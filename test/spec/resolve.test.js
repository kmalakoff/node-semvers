var assert = require('assert');

var NodeVersions = require('../..');

describe('resolve', function () {
  var now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));
  var semvers = null;

  before(function (callback) {
    NodeVersions.load({ cache: true }, function (err, _semvers) {
      semvers = _semvers;
      callback(err);
    });
  });

  describe('happy path', function () {
    it('12.14.0', function () {
      var version = semvers.resolve('12.14.0', { now: now });
      assert.deepEqual(version, { name: 'v12.14.0', version: '12.14.0', major: 12, minor: 14, patch: 0, schedule: 'v12', codename: 'erbium' });
    });

    it('v12.14.0', function () {
      var version = semvers.resolve('v12.14.0', { now: now });
      assert.deepEqual(version, { name: 'v12.14.0', version: '12.14.0', major: 12, minor: 14, patch: 0, schedule: 'v12', codename: 'erbium' });
    });

    it('12.14', function () {
      var version = semvers.resolve('12.14', { now: now });
      assert.deepEqual(version, { name: 'v12.14.1', version: '12.14.1', major: 12, minor: 14, patch: 1, schedule: 'v12', codename: 'erbium' });
    });

    it('v12.14', function () {
      var version = semvers.resolve('v12.14', { now: now });
      assert.deepEqual(version, { name: 'v12.14.1', version: '12.14.1', major: 12, minor: 14, patch: 1, schedule: 'v12', codename: 'erbium' });
    });

    it('12.14', function () {
      var version = semvers.resolve(12.14, { now: now });
      assert.deepEqual(version, { name: 'v12.14.1', version: '12.14.1', major: 12, minor: 14, patch: 1, schedule: 'v12', codename: 'erbium' });
    });

    it('12', function () {
      var version = semvers.resolve('12', { now: now });
      assert.deepEqual(version, { name: 'v12.16.3', version: '12.16.3', major: 12, minor: 16, patch: 3, schedule: 'v12', codename: 'erbium' });
    });

    it('v12', function () {
      var version = semvers.resolve('v12', { now: now });
      assert.deepEqual(version, { name: 'v12.16.3', version: '12.16.3', major: 12, minor: 16, patch: 3, schedule: 'v12', codename: 'erbium' });
    });

    it('12', function () {
      var version = semvers.resolve(12, { now: now });
      assert.deepEqual(version, { name: 'v12.16.3', version: '12.16.3', major: 12, minor: 16, patch: 3, schedule: 'v12', codename: 'erbium' });
    });

    it('lts', function () {
      var version = semvers.resolve('lts', { now: now });
      assert.deepEqual(version, { name: 'v14.2.0', version: '14.2.0', major: 14, minor: 2, patch: 0, schedule: 'v14' });
    });

    it('lts/dubnium', function () {
      var version = semvers.resolve('lts/dubnium', { now: now });
      assert.deepEqual(version, { name: 'v10.20.1', version: '10.20.1', major: 10, minor: 20, patch: 1, schedule: 'v10', codename: 'dubnium' });
    });

    it('dubnium', function () {
      var version = semvers.resolve('dubnium', { now: now });
      assert.deepEqual(version, { name: 'v10.20.1', version: '10.20.1', major: 10, minor: 20, patch: 1, schedule: 'v10', codename: 'dubnium' });
    });

    it('lts/*', function () {
      var version = semvers.resolve('lts/*', { now: now });
      assert.deepEqual(version, { name: 'v14.2.0', version: '14.2.0', major: 14, minor: 2, patch: 0, schedule: 'v14' });
    });

    it('latest', function () {
      var version = semvers.resolve('latest', { now: now });
      assert.deepEqual(version, { name: 'v13.14.0', version: '13.14.0', major: 13, minor: 14, patch: 0, schedule: 'v13' });
    });

    it('stable', function () {
      var version = semvers.resolve('stable', { now: now });
      assert.deepEqual(version, { name: 'v14.2.0', version: '14.2.0', major: 14, minor: 2, patch: 0, schedule: 'v14' });
    });

    it('10.x || >=12.0.0', function () {
      var versions = semvers.resolve('10.0.0 || ~12.0.0', { now: now });
      assert.equal(versions.length, 2);
      assert.deepEqual(versions[0], { name: 'v10.0.0', version: '10.0.0', major: 10, minor: 0, patch: 0, schedule: 'v10' });
      assert.deepEqual(versions[1], { name: 'v12.0.0', version: '12.0.0', major: 12, minor: 0, patch: 0, schedule: 'v12' });
    });

    it('>=0.6 (default)', function () {
      var versions = semvers.resolve('>=0.6', { now: now });
      assert.equal(versions.length, 433);
    });

    it('>=0.6 (range major)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'major' });
      assert.equal(versions.length, 12);
    });

    it('>=0.6 (range minor)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'minor' });
      assert.equal(versions.length, 161);
    });

    it('>=0.6 (range patch)', function () {
      var versions = semvers.resolve('>=0.6', { now: now, range: 'patch' });
      assert.equal(versions.length, 433);
    });

    it('promise', function (done) {
      if (typeof Promise === 'undefined') return done(); // no promise support

      NodeVersions.load({ cache: true })
        .then(function (semvers) {
          var version = semvers.resolve('lts/*', { now: now });
          assert.deepEqual(version, { name: 'v14.2.0', version: '14.2.0', major: 14, minor: 2, patch: 0, schedule: 'v14' });
          done();
        })
        .catch(done);
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
