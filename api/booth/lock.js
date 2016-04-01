var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    
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
        
        if (!((typeof data.removeAllDJs) === 'boolean')) {
            res.ends(['Missing removeAllDJs'], 400, 'bad request');
            return;
        }
        
        if (!((typeof data.isLocked) === 'boolean')) {
            res.ends(['Missing isLocked'], 400, 'bad request');
            return;
        }
        
        if (data.isLocked) 
            room.disableWaitlist(data.removeAllDJs, store.id, store.username);
        else 
            room.enableWaitlist(store.id, store.username);
        
        res.ends([]);
    });
}