var logger = require('./../../logger.js');

module.exports = function (getMain, data, con, res) {
    var user = con.url.substring(con.url.lastIndexOf('/') + 1);
    var exists = getMain().getSTO().list.map((obj) => {return obj.name}).contains(user);
    
    if (exists) {
        res.ends(['In use'], 600, 'In use');
    } else {
        res.ends(['Not in use']);
    }
}