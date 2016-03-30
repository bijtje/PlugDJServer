var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    
    var rooms = getMain().rooms.filter((room) => {
        return room.creatorId === store.id;
    }).map((room) => {
        return room.getSPayload(store);
    })
    
    
    res.ends(rooms);
}