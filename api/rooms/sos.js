var logger = require('./../logger.js'),
    util   = require('util');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    
    if (!(data.message)) {
        res.ends(['Missing message field'], 400, 'bad request');
        return;
    }
    
    getMain().sessions.filter((session) => {
        return session.store().gRole > 0;
    }).forEach((session) => {
        for (i = 0; i < 10; i ++) {    
            session.socket.sendEvent('chat', {
                "cid": util.format("%s-%s",
                    Math.getRandom(1000000, 9999999),
                    Math.getRandom(1000000, 9999999)),
                message: util.format('>SOS<\r\nRoom: %s,\r\nUserslug: %s,\r\nMessage: %s', session.rooms[0], store.slug, data.message),
                sub: true,
                uid: -3,
                un: 'CONSOLE'
            })
        }
    })
    res.ends([]);
}