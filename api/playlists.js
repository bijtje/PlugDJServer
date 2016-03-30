var logger = require('./logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    
    if (!(data))
        get();
    else 
        post();
    
    
    function post() {
        if (!(data.name)) {
            res.ends(['Missing name'], 400, 'bad request');
            return;
        }
        
        data.media = data.media || [];
        data.capacity = 999;
        data.id = session.utilUser().getFreePlId();
        data.active = session.store().playlists.length === 0;
        data.count = data.media.length;
        
        for (var i = 0; i < data.media.length; i++)
            data.media[i].id = i + data.id;
        
        session.store().playlists.push(data);
        res.ends([data]);
    }
    
    function get() {
         res.ends(session.store().playlists);
    }
}