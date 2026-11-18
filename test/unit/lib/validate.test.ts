import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { DISTS_URL, SCHEDULES_URL } from '../../../src/constants.ts';
import { validateIndex, validateSchedule } from '../../../src/lib/validate.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '..', '..', '..', '.cache');

function seedBody(endpoint: string): unknown {
  const files = fs.readdirSync(SEED_PATH);
  for (let index = 0; index < files.length; index++) {
    const record = JSON.parse(fs.readFileSync(path.join(SEED_PATH, files[index]), 'utf8'));
    const isIndex = Object.prototype.toString.call(record.body) === '[object Array]';
    if (isIndex === (endpoint === DISTS_URL)) return record.body;
  }
  throw new Error(`no seed for ${SCHEDULES_URL}`);
}

const GOOD = { version: 'v20.1.0', date: '2023-05-03', lts: false };

describe('lib/validate', () => {
  describe('index', () => {
    it('accepts the shipped seed', () => {
      const body = seedBody(DISTS_URL) as unknown[];
      assert.equal(validateIndex(body).length, body.length);
    });

    it('accepts lts null, lts true, a missing date and an alpha', () => {
      validateIndex([{ version: 'v20.1.0', lts: null }, { version: 'v20.1.1', lts: true }, { version: 'v20.1.2' }, { version: 'v27.0.0-alpha.0.1.0' }]);
    });

    const rejected: [string, unknown][] = [
      ['the portal body', { message: 'please sign in' }],
      ['an empty array', []],
      ['a null entry', [GOOD, null]],
      ['a numeric version', [{ version: 20 }]],
      ['latest', [{ version: 'latest' }]],
      ['a version without v', [{ version: '20.1.0' }]],
      ['a trailing dash', [{ version: 'v20.1.0-' }]],
      ['an empty prerelease part', [{ version: 'v20.1.0-rc..1' }]],
    ];
    for (let index = 0; index < rejected.length; index++) {
      const [name, body] = rejected[index];
      it(`rejects ${name}`, () => {
        assert.throws(() => validateIndex(body));
      });
    }
  });

  describe('schedule', () => {
    it('accepts the shipped seed', () => {
      const body = seedBody(SCHEDULES_URL) as Record<string, unknown>;
      assert.equal(Object.keys(validateSchedule(body)).length, Object.keys(body).length);
    });

    it('accepts a line without end or start', () => {
      validateSchedule({ v20: { start: '2023-04-18', lts: '2023-10-24', codename: 'Iron' }, v21: { end: '2024-06-01' } });
    });

    const rejected: [string, unknown][] = [
      ['an array', [{ start: '2023-04-18' }]],
      ['an empty object', {}],
      ['a string line', { v20: 'x' }],
      ['a null line', { v20: null }],
      ['codename true', { v20: { start: '2023-04-18', codename: true } }],
      ['codename 7', { v20: { start: '2023-04-18', codename: 7 } }],
    ];
    for (let index = 0; index < rejected.length; index++) {
      const [name, body] = rejected[index];
      it(`rejects ${name}`, () => {
        assert.throws(() => validateSchedule(body));
      });
    }
  });
});
