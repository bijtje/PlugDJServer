var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
     if (!(data)) {
         res.ends(['Use PUT'], 405, 'Bad request method');
         return;
     }
    
    var session = con.session;
    var store = session.store();
    
    var ownsAvatar = store.avatars.list.filter((obj) => {
        return obj.product_id === data.id
    }).length > -1;
    
    if (!(ownsAvatar)) {
         res.ends(['You know why... fuck off'], 402, 'Missing avatar');
         return;
    }
    
    store.avatarID = data.id;
    
    session.utilUser().updateUser();
    
    res.ends(['ok']);
}