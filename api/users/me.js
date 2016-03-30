var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    //hackfest  
    const a = con.session.store();
    res.ends([JSON.parse(JSON.stringify(a).replace(a.password, ''))]);
}