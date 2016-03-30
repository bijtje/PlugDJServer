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
        
        if (!(data.id)) {
            room.processWaitlistFromUser(session, true);
        } else {
            var requestee = getMain().sessions.filter((a) => {
                return a.accountId === data.id;
            })[0];
            
            if (!(requestee)) {
                res.ends(['User not found!'], 404, 'User not found!');
                return;
            }
            room.processWaitlistFromUser(requestee, true);
        }
        
        res.ends([]);
    });
}