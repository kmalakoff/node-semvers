var fs = require('fs');
var path = require('path');

var fetch = require('./fetch');

module.exports = function fetch(address, callback) {
  var fullPath = path.resolve(path.join(__dirname, '..', '.cache', encodeURIComponent(address)));
  fs.readFile(fullPath, function (err, content) {
    if (!err) return callback(null, JSON.parse(content));

    fetch(address, function (err, json) {
      if (err) return callback(err);

      fs.mkdir(path.dirname(fullPath), function (err) {
        if (err && err.code !== 'EEXIST') return callback(err);

        fs.writeFile(fullPath, JSON.stringify(json), 'utf8', function (err) {
          err ? callback(err) : callback(null, json);
        });
      });
    });
  });
};
