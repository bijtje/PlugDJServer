var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
     if (!(data)) {
         res.ends(['Use PUT'], 405, 'Bad request method');
         return;
     }
    
    var session = con.session;
    var store = session.store();
    
    var ownsBadge = store.badges.list.filter((obj) => {
        return obj.id === data.id
    }).length > -1;
    
    if (!(ownsBadge)) {
         res.ends(['You know why... fuck off'], 402, 'Missing avatar');
         return;
    }
    
    store.badge = data.id;
    
    session.utilUser().updateUser();
    
    res.ends(['ok']);
}