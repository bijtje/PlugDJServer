var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 406, 'not in a room');
            return;
        } 
        
        res.ends(room.getSafeUsers().filter((user) => { return user.role > 0}));
    });
}