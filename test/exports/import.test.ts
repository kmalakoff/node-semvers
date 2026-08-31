import assert from 'assert';
import NodeVersions from 'node-semvers';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof NodeVersions, 'function');
  });
});
