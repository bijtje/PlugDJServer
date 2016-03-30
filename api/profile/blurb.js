var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    if (!(data)) {
        res.ends(['PUT'], 405, 'Incorrect method');
        return;
    }
    
    if (!(data.blurb)) {
        res.ends(['Missing field'], 400, 'Bad Request');
        return;
    }
    
    var store = con.session.store();
    store.blurb = data.blurb; 
    res.ends([store]);
}