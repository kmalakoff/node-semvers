/**
 * Test Compatibility Layer for Node.js 0.8+
 * Uses native fs functions when available, falls back to ponyfills for old Node.
 */

import fs from 'fs';
import { safeRmSync } from 'fs-remove-compat';
import Module from 'module';
import path from 'path';
import url from 'url';

// Use existing require in CJS, or createRequire in ESM (Node 12.2+)
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const packageRoot = path.join(__dirname, '..', '..');

export function tmpdir(): string {
  return path.join(packageRoot, '.tmp');
}

export function rmRecursive(dir: string): void {
  safeRmSync(dir, { recursive: true, force: true });
}

// Native fs.mkdirSync({ recursive }) from Node 10.12, mkdirp-classic below
const nodeVersion = process.versions.node.split('.');
const hasRecursiveMkdir = +nodeVersion[0] > 10 || (+nodeVersion[0] === 10 && +nodeVersion[1] >= 12);
export function mkdirRecursive(dir: string): void {
  if (hasRecursiveMkdir) return fs.mkdirSync(dir, { recursive: true }) as void;
  _require('mkdirp-classic').sync(dir);
}
