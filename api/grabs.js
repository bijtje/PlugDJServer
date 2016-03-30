var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    
    if (!(data.historyID)) {
        res.ends(['Missing historyID'], 400, 'bad request');
        return;
    }
    
    if  (!((typeof data.playlistID) === 'number')) {
        res.ends(['Missing playlistID'], 400, 'bad request');
        return;
    }
    
    var room = getMain().rooms.filter((room) => {
        return room.playing.uid === data.historyID;
    })[0];
    
    var playlist = session.store().playlists.filter((pl) => {
        return pl.id === data.playlistID;
    })[0];
    
    if (!(room)) {
        res.ends(['No room found based on the historyId'], 204);
        return;
    }
    
    if (!(playlist)) {
        res.ends(['No playlist found based on the playlistID'], 204);
        return;
    }
    
    const ourInst = room.playing.media;
    const mediaIds = playlist.media.map((media) => {return media.id;});
    while (mediaIds.contains(ourInst.id))
        ourInst.id++;
    
    room.broadcast('grab', session.accountId);
    room.vote(session, 1);
    playlist.media.push(ourInst);
    playlist.media.count = playlist.media.length;
    res.ends(playlist.media);
}