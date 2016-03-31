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
            deleteBan(room);
        } else {
            res.ends(['Invalid method'], 405, 'Invalid method');
        }
    });

    function deleteBan(room) {
        var store = session.store();
        var id = url.substring(url.lastIndexOf('/') + 1);
        
        if (!(room.getRole(store.id) > 1 || store.gRole > 2)) {
            res.ends(['No permission'], 401, 'Unauthorised');
            return;
        }

        var ban = room.bans.filter((ban) => {
            return ban.id == id;
        })[0];
        
        if (!(ban)) {
            res.ends(['No ban on file'], 404, 'no ban on file');
            return;
        }
        
        remove(room.bans, ban);
        res.ends([]);
    }

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
        
        if (room.bans.filter((ban) => {
            return ban.id === user.id
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

        room.bans.push(payload);

        room.broadcast("modBan", {
            "m": payload.moderator,
            "i": payload.id,
            "t": payload.username,
            "r": payload.reason,
            "d": duration,
        });
        
        sessiona.socket.sendEvent("ban", {
            "d": payload.duration,
            "r": payload.reason,
            "t": 'ban',
        });
        
        res.ends([]);
    }
}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}