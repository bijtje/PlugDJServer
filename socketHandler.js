var express = require('express'),
    logger = require('./logger'),
    util = require('util'),
    http = require('http');

var WebSocketServer = require('websocket').server;

var disinfectConfig = {
    allowedTags: ['blockquote', 'b', 'i', 'strong', 'em', 'strike', 'code'],
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: {}
};

module.exports = function (getMain) {
    var server = http.createServer(function (request, response) {
        response.writeHead(404);
        response.end();
    });

    server.listen(getMain().config.sport, function () {
        logger.log('WebSocket server started');
    });

    wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });
    
    wsServer.on('request', function (req) {
        var conn = req.accept('echo-protocol', req.origin);
        conn.session = undefined;
                
        conn.sendEvent = (type, payload, room) => {
            var p = {a: type, p: payload, s: room || 'dashboard'};
            if ((!(room)) && (conn.session.rooms.length > 0))
                p.s = conn.session.rooms[0];
            conn.send(JSON.stringify([p]));
        };
        
        conn.on('gpayload', (data) => {
            try {
                var json = JSON.parse(data);
                var payload = {
                    type: json.a,
                    payload: json.p
                };
                
                switch (payload.type) {
                    case 'auth': 
                        var session = getMain().sessions.filter((obj) => {
                            return obj.token === payload.payload
                        })[0];
                        
                        if (!(session))
                            return;
                        
                        conn.session = session;
                        
                        if (session.socket) 
                            session.stop();
                        
                        session.socket = conn;
                        session.startPing();
                        
                        conn.sendEvent('ack', 1, 'dashboard');
                        
                        break;
                    case "chat":
                        if (!(conn.session)) 
                            return;
                        if (!(conn.session.loggedIn))
                            return;
                        if (payload.payload.replaceAll(' ', '') === '')
                            return;
                        conn.session.getRooms().forEach((room) => {
                            room.sendMessage(payload.payload,
                                             conn.session.store());
                        })
                        break;
                    default:
                        logger.debug('Didn\'t process %s', payload.type);
                        break;
                }
            } catch (e) {
                logger.warn(e.stack);
            }
        });
        
        conn.on('message', (message) => {
            if (message.type === 'utf8')
                conn.emit('gpayload', message.utf8Data);
        });

        conn.on('error',(reasonCode) => {
            if (reasonCode.toString().contains('write after end')) return;
            logger.warn(reasonCode)
        });

        conn.on('close', (reasonCode, description) => {
            logger.log(util.format('Peer %s disconnected for %s with code %s', conn.remoteAddress, description, reasonCode));

            if (!(conn.session))
                return;
            
            for (room of conn.session.getRooms()) {
                if (conn.session.loggedIn) 
                    room.leave(conn.session.accountId);
                else
                    room.updateGuestCount(false, conn.session);
            }
        });
    });
}
