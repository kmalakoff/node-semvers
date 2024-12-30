'use strict';

var Cache = require('fetch-json-cache');
var path = require('path');
var url = require('url');
var moduleRoot = require('module-root-sync');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
var __dirname$1 = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('postinstall.cjs', document.baseURI).href))) : __filename);
var root = moduleRoot(__dirname$1);
var constants = {
    CACHE_PATH: path.resolve(path.join(root, '.cache')),
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
    var cache = new Cache(constants.CACHE_PATH);
    cacheJSON(function(err) {
        if (err) {
            console.log("Failed to cache dists and schedules. Error: ".concat(err.message));
            return process.exit(err.code || -1);
        }
        process.exit(0);
    });
}

module.exports = postinstall;
