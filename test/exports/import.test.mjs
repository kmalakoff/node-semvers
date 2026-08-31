import assert from 'assert';
import NodeVersions from 'node-semvers';

describe('exports .mjs', () => {
  it('default', () => {
    assert.equal(typeof NodeVersions, 'function');
  });
});
