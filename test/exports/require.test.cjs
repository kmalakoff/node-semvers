const assert = require('assert');
const NodeVersions = require('node-semvers');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof NodeVersions, 'function');
  });
});
