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
                || (store.gRole > 0))) {
            res.ends(['No perms'], 401, 'Not an admin');
            return;
        }
        
        if (!(data)) {
            res.ends(['POST/PUT'], 405, 'Use POST OR PUT!');
            return;
        }
        
        const id = data.userID,
            pos = data.position;
        var oldPos = undefined,
            media = undefined;
        
        if (!((typeof id) === 'string')) {
            res.ends(['Missing id'], 400, 'Bad request');
            return;
        }
        
        if (!((typeof pos) === 'number')) {
            res.ends(['Missing pos'], 400, 'Bad request');
            return;
        }

        for (a in room.backlist) {
            var backlog = room.backlist[a];
            if (backlog.dj.store().id == id) {
                media = backlog;
                oldPos = a;
                room.backlist.splice(a, 1);
                break;
            }
        }
        
        if (media) 
            room.backlist.splice(pos, 0, media);
        
        res.ends(room.backlist);
    });
}