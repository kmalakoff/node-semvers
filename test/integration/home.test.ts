// Reaches the network: refreshes the version index from nodejs.org into a home folder under .tmp
import assert from 'assert';
import Cache from 'fetch-json-cache';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { CACHE_FORMAT, DISTS_URL } from '../../src/constants.ts';
import cacheFolders from '../../src/lib/cacheFolders.ts';
import cacheOptions from '../../src/lib/cacheOptions.ts';
import { rmRecursive, tmpdir } from '../lib/compat.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '..', '..', '.cache');

describe('home folder cache', () => {
  const home = path.join(tmpdir(), `home-${process.pid}`);

  before(() => rmRecursive(home));
  after(() => rmRecursive(home));

  it('refreshes into the home folder and leaves the seed alone', (done) => {
    const before = fs.readdirSync(SEED_PATH).map((file) => fs.readFileSync(path.join(SEED_PATH, file), 'utf8'));
    const folders = cacheFolders(undefined, home);
    // a seed this old loses to the fetched record only when the etag differs; force the write
    const cache = new Cache(folders.cachePath, cacheOptions(folders.seedPath));
    cache.get(DISTS_URL, { force: true }, (err) => {
      if (err) return done(err);
      const folder = path.join(home, '.node-semvers', 'cache', CACHE_FORMAT);
      assert.equal(fs.readdirSync(folder).length, 1);
      const after = fs.readdirSync(SEED_PATH).map((file) => fs.readFileSync(path.join(SEED_PATH, file), 'utf8'));
      assert.deepEqual(after, before);
      done();
    });
  });

  it('sync reads the newer of the home folder and the seed', () => {
    const folders = cacheFolders(undefined, home);
    const cache = new Cache(folders.cachePath, cacheOptions(folders.seedPath));
    const versions = cache.getSync<{ version: string }[]>(DISTS_URL);
    assert.ok(versions && versions.length > 0);
  });
});
