var https = require('https');

module.exports = function etag(src, callback) {
  var res = https.request(src, { method: 'HEAD' }, function (res) {
    if (res.statusCode !== 200) return callback(new Error('Status code ' + res.statusCode));
    callback(null, res.headers.etag);
  });
  res.on('error', callback);
  res.end();
};
