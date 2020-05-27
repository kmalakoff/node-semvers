var fs = require('fs');
var path = require('path');

var constants = require('../constants');
var fetch = require('./fetch');
var hash = require('./hash');

var CACHE_DIRECTORY = constants.CACHE_DIRECTORY;

module.exports = function update(src, callback) {
  var fullPath = path.join(CACHE_DIRECTORY, hash(src));
  fetch(src, function (err, record) {
    if (err) return callback(err);

    fs.mkdir(CACHE_DIRECTORY, function (err) {
      if (err && err.code !== 'EEXIST') return callback(err);

      fs.writeFile(fullPath, JSON.stringify(record), 'utf8', function (err) {
        err ? callback(err) : callback(null, record);
      });
    });
  });
};
