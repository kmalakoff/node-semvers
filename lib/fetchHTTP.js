var superagent = require('superagent');

module.exports = function fetch(address, callback) {
  superagent
    .get(address)
    .set('Accept', 'application/json')
    .end(function (err, res) {
      err ? callback(err) : callback(null, res.body);
    });
};
