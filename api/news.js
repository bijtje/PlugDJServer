var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    res.ends(getMain().config.news);
}