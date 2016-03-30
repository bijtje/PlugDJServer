var logger = require('./../../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    var id = con.url.substring(con.url.lastIndexOf('/') + 1);
    
    session.room((room) => { 
        if (!(room)) {
            res.ends(['Not in a room'], 200, 'showdash');
            return;
        }
        
        if (!((room.getRole(store.id) > 1)
                || (store.gRole > 2))) {
            res.ends(['No perms'], 401, 'Not an admin');
            return;
        }
        
        room.attemptRemoveWaitlist(id);
        
        res.ends([]);
    });
}