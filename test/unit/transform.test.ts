// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

// Reaches the network: fetches the version index from nodejs.org
import assert from 'assert';
import fs from 'fs';
import { safeRm } from 'fs-remove-compat';
import NodeVersions from 'node-semvers';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '..', 'cache-transform');
const FIELDS = ['version', 'date', 'lts'];

describe('cache transform', () => {
  before((callback) => safeRm(CACHE_DIR, callback));
  after((callback) => safeRm(CACHE_DIR, callback));

  // A cold cache forces a real fetch, so this proves the transform runs rather than reading a
  // seed that was already trimmed elsewhere.
  it('stores only the fields this package reads', (done) => {
    NodeVersions.load({ cachePath: CACHE_DIR }, (err) => {
      if (err) return done(err);

      const files = fs.readdirSync(CACHE_DIR);
      let index = null;
      for (let i = 0; i < files.length; i++) {
        const record = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, files[i]), 'utf8'));
        if (Object.prototype.toString.call(record.body) === '[object Array]') index = record.body;
      }

      assert.ok(index, 'expected a stored version index');
      assert.ok(index.length > 0, 'expected version records');
      assert.deepEqual(Object.keys(index[0]).sort(), FIELDS.slice().sort());
      done();
    });
  });

  it('leaves the schedule untouched', (done) => {
    NodeVersions.load({ cachePath: CACHE_DIR }, (err) => {
      if (err) return done(err);

      const files = fs.readdirSync(CACHE_DIR);
      let schedule = null;
      for (let i = 0; i < files.length; i++) {
        const record = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, files[i]), 'utf8'));
        if (Object.prototype.toString.call(record.body) !== '[object Array]') schedule = record.body;
      }

      assert.ok(schedule, 'expected a stored schedule');
      assert.ok(Object.keys(schedule).length > 0, 'expected schedule entries');
      assert.ok(schedule['v0.8'], 'expected the v0.8 line');
      done();
    });
  });
});
