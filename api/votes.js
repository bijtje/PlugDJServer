var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    
    if (!(data.historyID)) {
        res.ends(['Missing historyID'], 400, 'bad request');
        return;
    }
    
    if  (!((typeof data.direction) === 'number')) {
        res.ends(['Missing direction'], 400, 'bad request');
        return;
    }
    
    var room = getMain().rooms.filter((room) => {
        return room.playing.uid === data.historyID;
    })[0];
    
    if (!(room)) {
        res.ends(['No room found based on the historyId'], 204);
        return;
    }
    
    room.vote(session, data.direction);
    res.ends(['ayyyok']);
}