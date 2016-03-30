var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    res.ends([con.cookies.token]);
}