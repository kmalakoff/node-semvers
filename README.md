## node-semvers

Resolves individual and ranges for versions of Node.js by version numbers, version names, codenames, and expressions.

Follows a similat convention to nave (with the addition of semver expressions):

```
- x.y.z         A specific SemVer tuple
- x.y           Major and minor version number
- x             Just a major version number
- lts           The most recent LTS (long-term support) node version
- lts/<name>    The latest in a named LTS set. (argon, boron, etc.)
- lts/*         Same as just "lts"
- latest        The most recent (non-LTS) version
- stable        Backwards-compatible alias for "lts".
- [expression]  Engine and semver module expression like "10.1.x || >=12.0.0"
```

```
var assert = require('assert')
var NodeVersions = require('node-semvers')

NodeVersions.load(function (err, semvers) {
  var version = semvers.resolve('lts');
  assert.deepEqual(version, { name: 'v12.14.0', version: '12.14.0', major: 12, minor: 14, patch: 0, schedule: 'v12', codename: 'erbium' });
});

NodeVersions.load().then((semvers) => {
  const versions = semvers.resolve('10.0.0 || ~12.0.0');
  assert.equal(versions.length, 2);
  assert.deepEqual(versions[0], { name: 'v10.0.0', version: '10.0.0', major: 10, minor: 0, patch: 0, schedule: 'v10' });
  assert.deepEqual(versions[1], { name: 'v12.0.0', version: '12.0.0', major: 12, minor: 0, patch: 0, schedule: 'v12' });
});

```
