var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    
    session.room((room) => { 
        if (!(room)) {
            res.ends(['Not in a room'], 200, 'showdash');
            return;
        }
        
        if (!(room.attemptSkip(store.id)))  {
            res.ends(['Not an admin'], 401, 'Not an admin');
            return;
        }
        
        res.ends([]);
    });
}