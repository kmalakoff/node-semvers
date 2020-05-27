var https = require('https');
var url = require('url');

module.exports = function etag(src, callback) {
  // eslint-disable-next-line node/no-deprecated-api
  var parsed = url.parse(src);
  var req = https.request({ host: parsed.host, path: parsed.path, port: 443 });

  req.on('response', function response(res) {
    if (res.statusCode !== 200) return callback(new Error('Status code ' + res.statusCode));
    callback(null, res.headers.etag);
  });
  req.on('error', callback);
  req.end();
};
