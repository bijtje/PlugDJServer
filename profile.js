var logger = require('./logger.js'),
    userMan = require('./userstore.js'),
    util   = require('util');

module.exports = function (getMain, undef, con, res) {
  res.end('not setup');
}