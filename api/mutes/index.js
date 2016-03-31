var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var method = con.method;
    var url = con.url;
    
    session.room((room) => {
        if (!(room)) {
            res.ends(['Not in a room'], 406, 'not in a room');
            return;
        }

        if (method === 'POST') {
            if (url.endsWith('/add')) {
                post(room);
            }
        } else if (method === 'GET') {
            get(room);
        } else if (method === 'DELETE') {
            deleteMute(room);
         } else {
            res.ends(['Invalid method'], 405, 'Invalid method');
        }
    });

    function deleteMute(room) {
        var store = session.store();
        var id = url.substring(url.lastIndexOf('/') + 1);
        
        if (!(room.getRole(store.id) > 1 || store.gRole > 2)) {
            res.ends(['No permission'], 401, 'Unauthorised');
            return;
        }

        var mute = room.mutes.filter((mute) => {
            return mute.id == id;
        })[0];
        
        if (!(mute)) {
            res.ends(['No mute on file'], 404, 'no mute on file');
            return;
        }
        
        remove(room.mutes, mute);
        res.ends([]);
    }

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
                duration === "m" ? 1000 * 60 * 60 : duration === "d" ? 1000 * 60 * 60 * 24 : 333333333333);
        var sessiona = getMain().sessions.filter((user) => {
            return user.accountId === data.userID;
        })[0];
        
        if (!(sessiona))
            return;
        
        var user = sessiona.store();

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
        
        sessiona.socket.sendEvent("mute", {
            "d": payload.duration,
            "r": payload.reason,
            "t": 'mute',
        });
        
        res.ends([]);
    }
}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}