var fs = require('fs');
var path = require('path');

var constants = require('../constants');
var etag = require('./etag');
var hash = require('./hash');
var update = require('./update');

var CACHE_DIRECTORY = constants.CACHE_DIRECTORY;

module.exports = function get(src, callback) {
  var fullPath = path.join(CACHE_DIRECTORY, hash(src));
  fs.readFile(fullPath, function (err, contents) {
    // doesn't exist so create
    if (err) {
      update(src, function (err, record) {
        err ? callback(err) : callback(null, record.data);
      });
    }
    // check existing if etag changed and if so, recache
    else {
      var record = JSON.parse(contents.toString());
      etag(src, function (err, etag) {
        // not accessible
        if ((err && err.code === 'ENOTFOUND') || etag === record.etag) return callback(null, record.data);
        if (err) return callback(err)
        update(src, function (err, record) {
          err ? callback(err) : callback(null, record.data);
        });
      });
    }
  });
};
