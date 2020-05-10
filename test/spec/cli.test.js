var assert = require('assert');
var path = require('path');
var spawn = require('cross-spawn-cb');

describe('cli', function (done) {
  var now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));

  describe('happy path', function () {
    it('12.14.0', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['12.14.0', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v12.14.0\n');
        done();
      });
    });

    it('v12.14.0', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['v12.14.0', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (
        err,
        res
      ) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v12.14.0\n');
        done();
      });
    });

    it('12.14', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['12.14', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v12.14.1\n');
        done();
      });
    });

    it('v12.14', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['v12.14', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v12.14.1\n');
        done();
      });
    });

    it('12', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['12', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v12.16.3\n');
        done();
      });
    });

    it('v12', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['v12', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v12.16.3\n');
        done();
      });
    });

    it('lts', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['lts', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v14.2.0\n');
        done();
      });
    });

    it('lts/dubnium', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['lts/dubnium', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (
        err,
        res
      ) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v10.20.1\n');
        done();
      });
    });

    it('dubnium', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['dubnium', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v10.20.1\n');
        done();
      });
    });

    it('lts/*', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['lts/*', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v14.2.0\n');
        done();
      });
    });

    it('latest', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['latest', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v13.14.0\n');
        done();
      });
    });

    it('stable', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['stable', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v14.2.0\n');
        done();
      });
    });
  });

  describe('happy path range', function () {
    it('10.x || >=12.0.0', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['10.0.0 || ~12.0.0', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (
        err,
        res
      ) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout, 'v10.0.0\nv12.0.0\n');
        done();
      });
    });

    it('>=0.6 (default)', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['>=0.6', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.equal(res.stdout.split('\n').length - 1, 433);
        done();
      });
    });

    it('>=0.6 (range major)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'major'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          assert.equal(res.stdout.split('\n').length - 1, 18);
          done();
        }
      );
    });

    it('>=0.6 (range minor)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'minor'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          assert.equal(res.stdout.split('\n').length - 1, 316);
          done();
        }
      );
    });

    it('>=0.6 (range patch)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'patch'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          assert.equal(res.stdout.split('\n').length - 1, 433);
          done();
        }
      );
    });
  });
});
