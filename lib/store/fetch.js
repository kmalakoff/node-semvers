var https = require('https');
var eos = require('end-of-stream');

module.exports = function etag(src, callback) {
  var res = https.request(src, { method: 'GET' }, function (res) {
    if (res.statusCode !== 200) return callback(new Error('Status code ' + res.statusCode));
    var string = '';
    res.on('data', function data(chunk) {
      string += chunk.toString();
    });
    eos(res, function (err) {
      err ? callback(err) : callback(null, { etag: res.headers.etag, data: JSON.parse(string) });
    });
  });
  res.on('error', callback);
  res.end();
};
