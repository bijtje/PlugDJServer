var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var slug = data.slug;

    var room = getMain().rooms.filter((obj) => {
        return obj.slug === slug;
    })[0];


    if ((slug === "dashboard") || (!(room))) {
        res.ends(["Room not found"], 405, "showdash");
        return;
    } else if (!(room)) {
        res.ends(["Room not found"], 404);
        return;
    }
 
    for (room of con.session.getRooms()) {
        if (con.session.loggedIn)
            room.leave(con.session.accountId);
        else
            room.updateGuestCount(false, con.session);
    }
    

   //if (!(con.session.rooms.contains(slug))) #push
   con.session.rooms = [slug];
    
 

    if (con.session.loggedIn) {
        var ban = room.isBanned(con.session.store().id);
        if (ban) {
            res.ends([{
                r: ban.reason,
                e: (ban.date - Date.leg_now()) / 1000,
                d: ban.duration
            }], 410, 'ban');
            return;
        }
        room.addUser(con.session);
    } else
        room.updateGuestCount(true, con.session);

    res.ends({});
}
