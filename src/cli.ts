import exit from 'exit-compat';
import fs from 'fs';
import getopts from 'getopts-compat';
import path from 'path';
import url from 'url';
import type NodeVersionsClass from './index.ts';
import type { LoadOptions, ResolveOptions } from './index.ts';
// biome-ignore lint/suspicious/noShadowRestrictedNames: Legacy
import isNaN from './lib/isNaN.ts';

const isArray = Array.isArray || ((x) => Object.prototype.toString.call(x) === '[object Array]');

const ERROR_CODE = 11;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

function getVersion(): string {
  const pkgPath = path.join(__dirname, '..', '..', 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
}

function printHelp(name: string): void {
  const version = getVersion();
  console.log(`${name} v${version}`);
  console.log('');
  console.log(`Usage: ${name} [options] <version-string>`);
  console.log('');
  console.log('Version Strings:');
  console.log('Any command that calls for a version can be provided any of the');
  console.log('following "version-ish" identifies:');
  console.log('');
  console.log('- x.y.z        A specific SemVer tuple');
  console.log('- x.y          Major and minor version number');
  console.log('- x            Just a major version number');
  console.log('- lts          The most recent LTS (long-term support) node version');
  console.log('- lts/<name>   The latest in a named LTS set. (argon, boron, etc.)');
  console.log('- lts/*        Same as just "lts"');
  console.log('- latest       The most recent (non-LTS) version');
  console.log('- stable       Backwards-compatible alias for "lts"');
  console.log('- [expression] Engine and semver module expression like "10.1.x || >=12.0.0"');
  console.log('');
  console.log('Options:');
  console.log('  -p, --path <path>    Path within version including raw for unprocessed version');
  console.log('  -r, --range <range>  Range type of major, minor, or patch with filters of lts, even, odd');
  console.log('  -n, --now <date>     Use a specific time as a Date.parse');
  console.log('  -v, --version        Show version number');
  console.log('  -h, --help           Show this help message');
}

export default (argv: string[], name?: string): void => {
  const cliName = name || 'nsv';
  const options = getopts(argv, {
    alias: { path: 'p', range: 'r', now: 'n', version: 'v', help: 'h' },
    boolean: ['version', 'help'],
  });

  if (options.version) {
    console.log(getVersion());
    exit(0);
    return;
  }

  if (options.help) {
    printHelp(cliName);
    exit(0);
    return;
  }

  if (typeof options.now !== 'undefined') options.now = new Date(isNaN(+options.now) ? Date.parse(options.now) : +options.now);

  const args = options._;
  if (args.length < 1) {
    console.log(`Missing version string. Example usage: ${cliName} [version string]. Use ${cliName} --help for information on version strings`);
    exit(ERROR_CODE);
    return;
  }

  function stringify(value: unknown) {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  // deferred: index.ts pulls fetch-json-cache/semver. require() cannot load this ESM sibling below
  // Node 20.19 (require(esm)), so the ESM half needs a real dynamic import; the CJS half's sibling
  // is genuine CommonJS, so a plain synchronous require avoids depending on Promise, which isn't
  // global before Node 0.12.
  loadIndex((err, NodeVersions) => {
    if (err || !NodeVersions) {
      console.log(err ? err.message : 'Failed to load node-semvers');
      return exit(ERROR_CODE);
    }

    NodeVersions.load(options as LoadOptions, (err, semvers) => {
      if (err) {
        console.log(err.message);
        return exit(ERROR_CODE);
      }

      const version = semvers?.resolve(args[0], options as ResolveOptions);
      if (!version || (isArray(version) && !(version as string[]).length)) {
        console.log(`Unrecognized: ${args[0]}`);
        return exit(ERROR_CODE);
      }

      console.log('versions:');
      if (isArray(version)) {
        for (let index = 0; index < (version as string[]).length; index++) console.log(stringify(version[index]));
      } else console.log(stringify(version));
      exit(0);
    });
  });
};

function loadIndex(callback: (err: Error | null, NodeVersions?: typeof NodeVersionsClass) => void): void {
  if (typeof require === 'undefined') {
    import('./index.js').then((mod) => callback(null, mod.default || mod)).catch((err) => callback(err instanceof Error ? err : new Error(String(err))));
  } else {
    try {
      const mod = require('./index.js');
      callback(null, mod.default || mod);
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
