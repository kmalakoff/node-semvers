import assert from 'assert';
import fs from 'fs';
import { safeRmSync } from 'fs-remove-compat';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const SEED_PATH = path.join(ROOT, '.cache');

export default function useCache(suite: string): string {
  const cachePath = path.join(ROOT, '.tmp', `cache-${suite}-${process.pid}`);
  let seeds: { file: string; contents: Buffer }[];

  before(() => {
    safeRmSync(cachePath);
    seeds = fs.readdirSync(SEED_PATH).map((file) => ({ file, contents: fs.readFileSync(path.join(SEED_PATH, file)) }));
  });

  after(() => {
    safeRmSync(cachePath);
    assert.deepEqual(
      fs.readdirSync(SEED_PATH),
      seeds.map(({ file }) => file),
      'tests must not create shipped cache files'
    );
    for (const { file, contents } of seeds) {
      assert.deepEqual(fs.readFileSync(path.join(SEED_PATH, file)), contents, `tests must not refresh shipped cache ${file}`);
    }
  });

  return cachePath;
}
