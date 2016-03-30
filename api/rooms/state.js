var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    
    session.room((room) => { 
        if (!(room)) {
            res.ends(["Not in a room"], 200, 'showdash');
            return;
        }
        
        res.ends([room.getPayload(session.store())]);
    });
}
