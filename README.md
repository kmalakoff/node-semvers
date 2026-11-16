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
- lts           The newest line that has reached LTS (long-term support) and is still supported
- lts/<name>    The latest in a named LTS set. (argon, boron, etc.)
- lts/*         Same as just "lts"
- latest        The newest line that has reached Current (stable) and is still supported, whether or not it is LTS too
- stable        Backwards-compatible alias for "lts".
- [expression]  Engine and semver module expression like "10.1.x || >=12.0.0"
```

## Usage

```js
var NodeVersions = require('node-semvers');

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

## Release schedule

From Node 27 on, Node publishes one major a year ([nodejs/Release](https://github.com/nodejs/Release/blob/main/README.md)). Each line is Alpha for six months, Current from April, and LTS from October, odd or even.

- Alpha releases (for example `v27.0.0-alpha.0.1.0`) are never chosen by `lts`, `latest`, a major such as `27`, or a range such as `>=20`. Only the exact version string selects one.
- The `even` and `odd` range filters stay literal major parity. They do not mean LTS: odd lines are LTS from 27.
- `latest` and `lts` follow the dates in the release schedule at the time given by `now`, so `lts` is `v24.x` until `v26` becomes LTS.
