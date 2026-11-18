import assert from 'assert';
import path from 'path';
import { CACHE_FORMAT, CACHE_PATH } from '../../../src/constants.ts';
import cacheFolders from '../../../src/lib/cacheFolders.ts';

const HOME = path.resolve('/home/someone');

describe('lib/cacheFolders', () => {
  it('cachePath means that folder only', () => {
    const folders = cacheFolders('/explicit/folder', HOME);
    assert.equal(folders.cachePath, '/explicit/folder');
    assert.equal(folders.seedPath, undefined);
    assert.equal(folders.error, undefined);
  });

  it('an explicit cachePath needs no home', () => {
    const folders = cacheFolders('/explicit/folder', null);
    assert.equal(folders.cachePath, '/explicit/folder');
    assert.equal(folders.error, undefined);
  });

  it('an absolute home gives the home folder plus the seed', () => {
    const folders = cacheFolders(undefined, HOME);
    assert.equal(folders.cachePath, path.join(HOME, '.node-semvers', 'cache', CACHE_FORMAT));
    assert.equal(folders.seedPath, CACHE_PATH);
    assert.equal(folders.home, HOME);
    assert.equal(folders.error, undefined);
  });

  it('the format folder is v1', () => {
    assert.equal(CACHE_FORMAT, 'v1');
  });

  const unusable: [string, string | null | undefined][] = [
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
    ['a dot', '.'],
    ['a relative path', 'rel/dir'],
  ];
  for (let index = 0; index < unusable.length; index++) {
    const [name, home] = unusable[index];
    it(`${name} reads the seed and errors for refreshes`, () => {
      const folders = cacheFolders(undefined, home);
      assert.equal(folders.cachePath, CACHE_PATH);
      assert.equal(folders.seedPath, undefined);
      assert.ok(folders.error);
      assert.equal(folders.error?.message, `node-semvers: no usable home folder ("${home || ''}"); pass the cachePath option`);
    });
  }
});
