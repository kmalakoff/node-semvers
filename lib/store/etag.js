var http = require('http');
var https = require('https');
var url = require('url');

module.exports = function etag(src, callback) {
  // eslint-disable-next-line node/no-deprecated-api
  var parsed = url.parse(src);
  var req = https.request({ host: parsed.host, path: parsed.path, port: 443 });

  req.on('response', function response(res) {
    if (res.statusCode !== 200) {
      res.resume(); // Discard response
      return callback(new Error('Response code ' + res.statusCode + ' (' + http.STATUS_CODES[res.statusCode] + ')'));
    }
    res.resume(); // Discard response
    callback(null, res.headers.etag);
  });
  req.on('error', callback);
  req.end();
};
