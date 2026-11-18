import assert from 'assert';
import Cache from 'fetch-json-cache';
import fs from 'fs';
import http from 'http';
import path from 'path';
import cacheError from '../../../src/lib/cacheError.ts';
import { mkdirRecursive, rmRecursive, tmpdir } from '../../lib/compat.ts';

const isWindows = process.platform === 'win32';

type FsError = Error & { code?: string; syscall?: string; path?: string; cause?: unknown };

function fsError(code: string, syscall: string | undefined, errPath: string): FsError {
  const err = new Error(`${code}: operation failed, ${syscall} '${errPath}'`) as FsError;
  err.code = code;
  if (syscall) err.syscall = syscall;
  err.path = errPath;
  return err;
}

describe('lib/cacheError', () => {
  const root = path.join(tmpdir(), `cacheError-${process.pid}`);
  const home = path.join(root, 'home');
  const folder = path.join(home, '.node-semvers', 'cache', 'v1');

  before(() => {
    rmRecursive(root);
    mkdirRecursive(root);
  });
  after(() => {
    if (!isWindows && fs.existsSync(home)) fs.chmodSync(home, 0o755);
    rmRecursive(root);
  });

  describe('real fs errors', () => {
    // fetch-json-cache creates the cache folder on a write; a cold get of a real endpoint is not
    // needed, so provoke the same mkdir directly
    function mkdirFolder(cachePath: string): FsError | null {
      try {
        // the first missing level, as fetch-json-cache's mkdirp makes it; Node 10's recursive mkdir reports ENOENT here
        fs.mkdirSync(path.join(cachePath, '..', '..'));
        return null;
      } catch (err) {
        return err as FsError;
      }
    }

    (isWindows ? it.skip : it)('a mkdir under a read-only parent of the cache folder is rewritten', () => {
      mkdirRecursive(home);
      fs.chmodSync(home, 0o555);
      if (process.getuid && process.getuid() === 0) return; // root can write anywhere
      const raw = mkdirFolder(folder);
      assert.ok(raw, 'expected a mkdir error');
      const err = cacheError(raw as Error, folder, home);
      assert.notEqual(err, raw);
      assert.ok(err.message.indexOf(folder) >= 0, err.message);
      assert.ok(err.message.indexOf('cachePath') >= 0, err.message);
      assert.ok(err.message.indexOf('EACCES') >= 0, err.message);
      fs.chmodSync(home, 0o755);
    });

    it('ENOTDIR from a cache folder under a regular file is rewritten', () => {
      const file = path.join(root, 'a-file');
      fs.writeFileSync(file, 'x');
      const target = path.join(file, '.node-semvers', 'cache', 'v1');
      const raw = mkdirFolder(target);
      assert.ok(raw, 'expected a mkdir error');
      const err = cacheError(raw as Error, target, file);
      assert.notEqual(err, raw);
      assert.ok(err.message.indexOf(target) >= 0, err.message);
      assert.ok(err.message.indexOf('cachePath') >= 0, err.message);
    });

    // The fetch succeeds against a local server, so the write is what fails, whichever way the OS refuses it
    (+process.versions.node.split('.')[0] === 0 ? it.skip : it)('a real Cache refused by a regular file is rewritten', (done) => {
      const file = path.join(root, 'b-file');
      fs.writeFileSync(file, 'x');
      const target = path.join(file, 'cache');
      const server = http.createServer((_req, res) => {
        res.writeHead(200, { 'content-type': 'application/json', etag: '"local"' });
        res.end(JSON.stringify([{ version: 'v20.1.0', date: '2023-05-03', lts: false }]));
      });
      server.listen(0, '127.0.0.1', () => {
        const port = (server.address() as { port: number }).port;
        new Cache(target).get(`http://127.0.0.1:${port}/index.json`, (raw) => {
          server.close();
          assert.ok(raw, 'expected the write to fail');
          const err = cacheError(raw as Error, target, file) as FsError;
          assert.notEqual(err, raw);
          assert.equal(err.cause, raw);
          assert.ok(err.message.indexOf(target) >= 0, err.message);
          assert.ok(err.message.indexOf('cachePath') >= 0, err.message);
          done();
        });
      });
    });
  });

  describe('ownership hint', () => {
    const codes = ['EACCES', 'EPERM', 'EROFS', 'ENOTDIR'];
    for (let index = 0; index < codes.length; index++) {
      const code = codes[index];
      const hint = code === 'EACCES' || code === 'EPERM';
      it(`${code} ${hint ? 'carries' : 'omits'} the owned-by-another-user line`, () => {
        const err = cacheError(fsError(code, 'mkdir', path.join(home, '.node-semvers')), folder, home);
        assert.ok(err.message.indexOf('cannot write the cache folder') >= 0, err.message);
        assert.equal(err.message.indexOf('owned by another user') >= 0, hint, err.message);
        if (hint) assert.ok(err.message.indexOf(`remove ${path.join(home, '.node-semvers')}`) >= 0, err.message);
      });
    }

    it('the message starts with the package name and ends with the fix', () => {
      const err = cacheError(fsError('EROFS', 'open', path.join(folder, 'x.json.tmp')), folder, home);
      assert.equal(err.message.indexOf(`node-semvers: cannot write the cache folder ${folder} (EROFS: `), 0, err.message);
      assert.ok(err.message.indexOf('The home folder must be writable, or pass the cachePath option.') > 0, err.message);
    });
  });

  describe('ENOENT, as Windows reports a mkdir beneath a regular file', () => {
    it('is rewritten for a mkdir on the cache folder, without the sudo hint', () => {
      const raw = fsError('ENOENT', 'mkdir', path.join(home, '.node-semvers'));
      const err = cacheError(raw, folder, home) as FsError;
      assert.notEqual(err, raw);
      assert.equal(err.code, 'ENOENT');
      assert.equal(err.cause, raw);
      assert.ok(err.message.indexOf('cachePath') >= 0, err.message);
      assert.equal(err.message.indexOf('owned by another user'), -1, err.message);
    });

    it('is rewritten for an open inside the cache folder, without the sudo hint', () => {
      const raw = fsError('ENOENT', 'open', path.join(folder, 'x.json.tmp'));
      const err = cacheError(raw, folder, home) as FsError;
      assert.notEqual(err, raw);
      assert.equal(err.cause, raw);
      assert.equal(err.code, 'ENOENT');
      assert.ok(err.message.indexOf('cachePath') >= 0, err.message);
      assert.equal(err.message.indexOf('owned by another user'), -1, err.message);
    });

    it('is left raw for an open outside the cache folder, or on a parent of it', () => {
      const outside = fsError('ENOENT', 'open', path.join(root, 'elsewhere', 'x.json'));
      assert.equal(cacheError(outside, folder, home), outside);
      const parent = fsError('ENOENT', 'open', path.join(home, '.node-semvers'));
      assert.equal(cacheError(parent, folder, home), parent);
    });
  });

  describe('left raw', () => {
    const raws: [string, FsError][] = [
      ['a rename', fsError('EACCES', 'rename', path.join(folder, 'x.json'))],
      ['an EBUSY', fsError('EBUSY', 'open', path.join(folder, 'x.json'))],
      ['an unrelated path', fsError('EACCES', 'mkdir', path.join(root, 'elsewhere'))],
      ['an unrelated code', fsError('ENOTEMPTY', 'mkdir', folder)],
      ['an ENOENT mkdir on an unrelated path', fsError('ENOENT', 'mkdir', path.join(root, 'elsewhere'))],
    ];
    for (let index = 0; index < raws.length; index++) {
      const [name, raw] = raws[index];
      it(`${name} comes back as the same object`, () => {
        assert.equal(cacheError(raw, folder, home), raw);
      });
    }
  });

  describe('fields', () => {
    it('keeps cause, code and path, and the code in the message', () => {
      const raw = fsError('EACCES', 'mkdir', path.join(home, '.node-semvers'));
      const err = cacheError(raw, folder, home) as FsError;
      assert.equal(err.cause, raw);
      assert.equal(err.code, 'EACCES');
      assert.equal(err.path, raw.path);
      assert.ok(err.message.indexOf('EACCES') >= 0);
    });
  });

  describe('operation fallback for Node 0.8 and 0.10', () => {
    it('reads mkdir from the message when there is no syscall', () => {
      const p = path.join(home, '.node-semvers');
      const raw = new Error(`EACCES, mkdir '${p}'`) as FsError;
      raw.code = 'EACCES';
      raw.path = p;
      const err = cacheError(raw, folder, home);
      assert.notEqual(err, raw);
      assert.ok(err.message.indexOf('cachePath') >= 0);
    });

    it('reads rename from the message when there is no syscall', () => {
      const p = path.join(folder, 'x.json');
      const raw = new Error(`EACCES, rename '${p}'`) as FsError;
      raw.code = 'EACCES';
      raw.path = p;
      assert.equal(cacheError(raw, folder, home), raw);
    });
  });
});
