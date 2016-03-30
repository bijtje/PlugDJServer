var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var method = con.method; 
    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 406, 'not in a room');
            return;
        }
        
        get(room);
    });

    function get(room) {
        var array = [];
        room.bans.forEach((ban) => {
            const p = {
                expires: (ban.date - Date.leg_now()) / 1000,
                moderator: ban.moderator,
                id: ban.id,
                username: ban.username,
                reason: ban.reason,
            };

            if (p.expires > 0)
                array.push(p);
            else
                remove(room.bans, ban);
        })
        res.ends(array);
    }

}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}