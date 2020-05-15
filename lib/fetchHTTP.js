var https = require('https');
var url = require('url');
var eos = require('end-of-stream');

module.exports = function fetch(address, callback) {
  // eslint-disable-next-line node/no-deprecated-api
  var parsed = url.parse(address);
  var req = https.request({ host: parsed.host, path: parsed.path, port: 443 });

  req.on('response', function response(res) {
    var string = '';
    res.on('data', function data(chunk) {
      string += chunk.toString();
    });
    eos(res, function (err) {
      err ? callback(err) : callback(null, JSON.parse(string));
    });
  });
  req.end();
};
