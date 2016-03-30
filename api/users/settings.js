var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    if (!(data)) {
        res.ends(con.session.store().settings);
        return;
    }
    for (key of Object.keys(data)) {
        con.session.store().settings[key] = data[key]; 
    }
    res.ends(con.session.store().settings);
}