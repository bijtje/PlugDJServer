var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 406, 'not in a room');
            return;
        }

        if (data)
            post(room);
        else
            get(room);
    });


    function get(room) {
        var array = [];
        room.mutes.forEach((mute) => {
            const p = {
                expires: (mute.date - Date.leg_now()) / 1000,
                moderator: mute.moderator,
                id: mute.id,
                username: mute.username,
                reason: mute.reason,
            };

            if (p.expires > 0)
                array.push(p);
            else
                remove(room.mutes, mute);
        })
        res.ends(array);
    }

    function post(room) {
        var store = session.store();
        
        if (!(room.getRole(store.id) > 1 || store.gRole > 2)) {
            res.ends(['No permission'], 401, 'Unauthorised');
            return;
        }

        var duration = data.duration;
        var time =
            Date.leg_now() + (
                duration === "m" ? 1800000 : duration === "s" ? 900000 : 2700000);
        var user = room.getSafeUsers().filter((user) => {
            return user.id === data.userID;
        })[0];

        if (!(user))
            return;
        
        if (room.mutes.filter((mute) => {
            return mute.id === user.id
        }).length > 0) {
            res.ends({});
            return;
        }

        var payload = {
            date: time,
            reason: data.reason,
            id: user.id,
            duration: duration,
            username: user.slug,
            moderator: store.username
        };

        room.mutes.push(payload);

        room.broadcast("modMute", {
            "m": payload.moderator,
            "i": payload.id,
            "t": payload.username,
            "r": payload.reason,
            "d": duration,
        });
        
        res.ends({});
    }
}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}