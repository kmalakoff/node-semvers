var assert = require('assert');
var path = require('path');
var spawn = require('cross-spawn-cb');

function major(version) {
  var parts = version.substr(1).split('.');
  return parts[0] === '0' ? +parts[1] : +parts[0];
}

describe('cli', function (done) {
  var now = new Date(Date.parse('2020-05-10T03:23:29.347Z'));

  describe('happy path', function (done) {
    it('12.14.0', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['12.14.0', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v12.14.0');
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
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v12.14.0');
        done();
      });
    });

    it('12.14', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['12.14', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v12.14.1');
        done();
      });
    });

    it('v12.14', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['v12.14', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v12.14.1');
        done();
      });
    });

    it('12', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['12', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v12.16.3');
        done();
      });
    });

    it('v12', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['v12', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v12.16.3');
        done();
      });
    });

    it('lts', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['lts', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v14.2.0');
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
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v10.20.1');
        done();
      });
    });

    it('dubnium', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['dubnium', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v10.20.1');
        done();
      });
    });

    it('lts/*', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['lts/*', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v14.2.0');
        done();
      });
    });

    it('latest', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['latest', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v13.14.0');
        done();
      });
    });

    it('stable', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['stable', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var version = res.stdout.split('\n')[0];
        assert.equal(version, 'v14.2.0');
        done();
      });
    });
  });
  describe('happy path range', function (done) {
    it('10.x || >=12.0.0', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['10.0.0 || ~12.0.0', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (
        err,
        res
      ) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var versions = res.stdout.split('\n').slice(0, -1);
        assert.deepEqual(versions, ['v10.0.0', 'v12.0.0']);
        done();
      });
    });

    it('>=0.6 (default)', function (done) {
      spawn(path.join(__dirname, '..', '..', 'bin', 'node-semvers'), ['>=0.6', '--cache', '--now', now.getTime()], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var versions = res.stdout.split('\n').slice(0, -1);
        assert.deepEqual(versions.length, 433);
        done();
      });
    });

    it('>=0.6 (lts)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'lts'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 116);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (even)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'even'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 302);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (odd)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'odd'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 131);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        }
      );
    });

    it('>=0.6 (range major)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'major'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 18);
          done();
        }
      );
    });

    it('>=0.6 (range major,lts)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'major,lts'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 5);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (range major,even)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'major,even'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 10);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (range major,odd)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'major,odd'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 8);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
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
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 316);
          done();
        }
      );
    });

    it('>=0.6 (range minor,lts)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'minor,lts'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 38);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (range minor,even)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'minor,even'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 206);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (range minor,odd)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'minor,odd'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 110);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
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
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 433);
          done();
        }
      );
    });

    it('>=0.6 (range patch,lts)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'patch,lts'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 116);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (range patch,even)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'patch,even'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 302);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 0);
          }
          done();
        }
      );
    });

    it('>=0.6 (range patch,odd)', function (done) {
      spawn(
        path.join(__dirname, '..', '..', 'bin', 'node-semvers'),
        ['>=0.6', '--cache', '--now', now.getTime(), '--range', 'patch,odd'],
        { stdout: 'string' },
        function (err, res) {
          assert.ok(!err);
          assert.equal(res.code, 0);
          var versions = res.stdout.split('\n').slice(0, -1);
          assert.deepEqual(versions.length, 131);
          for (var index = 0; index < versions.length; index++) {
            assert.ok(major(versions[index]) % 2 === 1);
          }
          done();
        }
      );
    });
  });
});
