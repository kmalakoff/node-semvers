# node-semvers

Resolves individual and ranges for versions of Node.js by version numbers, version names, codenames, and expressions.

```bash
npm install node-semvers
```

Follows a similar convention to [nave](https://github.com/isaacs/nave) with the addition of semver expressions:

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

## Usage

```js
var NodeVersions = require('node-semvers')

NodeVersions.load(function (err, semvers) {
  if (err) throw err;
  var version = semvers.resolve('lts');
  console.log(version);
});

NodeVersions.load().then(function (semvers) {
  console.log(semvers.resolve('10.0.0 || ~12.0.0'));
});

```

The resolved version names and LTS schedule change as Node.js publishes releases. The `nsv` executable accepts the same expressions, for example `nsv 'lts/*'` or `nsv '>=18'`.
