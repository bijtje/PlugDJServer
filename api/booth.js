var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 406, 'not in a room');
            return;
        } 
        
        if (con.method === 'DELETE') {
            var uid = con.session.store().id;
            if (room.playing.dj.store().id === uid) {
                room.stopPlaying(false, false, true);
            } else {
                room.attemptRemoveWaitlist(uid);
            }
            res.ends([]);
        } else if (con.method === 'POST') {
            room.processWaitlistFromUser(con.session);
            res.ends([]);
        } else {
            res.ends(['?'], 405, 'Use POST or DELETE!');
        }
    });
}