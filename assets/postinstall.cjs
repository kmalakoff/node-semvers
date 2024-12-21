(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('exit'), require('fetch-json-cache'), require('path'), require('url'), require('fs'), require('fs-access-sync-compat')) :
  typeof define === 'function' && define.amd ? define(['exit', 'fetch-json-cache', 'path', 'url', 'fs', 'fs-access-sync-compat'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tsdsBuild = factory(global.exit, global.Cache, global.path, global.url, global.fs, global.accessSync));
})(this, (function (exit, Cache, path, url, fs, accessSync) { 'use strict';

  var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
  function existsSync(path) {
      try {
          accessSync(path);
          return true;
      } catch (_err) {
          return false;
      }
  }

  function packageRoot(dir) {
      var packagePath = path.join(dir, 'package.json');
      if (existsSync(packagePath) && JSON.parse(fs.readFileSync(packagePath, 'utf8')).name) return dir;
      var nextDir = path.dirname(dir);
      if (nextDir === dir) throw new Error('Package root not found');
      return packageRoot(nextDir);
  }

  var __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath((typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('postinstall.cjs', document.baseURI).href))));
  var root = packageRoot(__dirname);
  var constants = {
      CACHE_DIRECTORY: path.resolve(path.join(root, '.cache')),
      DISTS_URL: 'https://nodejs.org/dist/index.json',
      SCHEDULES_URL: 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json'
  };

  function postinstall() {
      var cacheJSON = function cacheJSON(callback) {
          cache.get(constants.DISTS_URL, {
              force: true
          }, function(err) {
              err ? callback(err) : cache.get(constants.SCHEDULES_URL, {
                  force: true
              }, callback);
          });
      };
      var cache = new Cache(constants.CACHE_DIRECTORY);
      cacheJSON(function(err) {
          if (err) {
              console.log("Failed to cache dists and schedules. Error: ".concat(err.message));
              return exit(err.code || -1);
          }
          exit(0);
      });
  }

  return postinstall;

}));
