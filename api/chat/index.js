var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    
    session.room((room) => { 
        if (!(room)) {
            res.ends(['Not in a room'], 200, 'showdash');
            return;
        }
        
        if (!((room.getRole(store.id) > 1) || (store.gRole > 2))) {
            res.ends(['No perms'], 401, 'Unauthorised request');
            return;
        } 
        
        room.removeMessage(con.url.substring(con.url.lastIndexOf('/') + 1), store.id);   
    });
}