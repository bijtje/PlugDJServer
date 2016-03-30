var express = require('express'),
    logger  = require('./logger'),
    util    = require('util');

module.exports = function(getMain, token) {
    this.token = token;
    this.rooms = [];
    this.loggedIn = false;
    this.accountId = undefined;
    this.socket = undefined;
    this.sendingPings = false;
    var share = undefined;
    var _self = this;
    
    this.utilUser = () => {
        
        this.getSPayload = (room) => {
            var store = _self.store();
            return {
                "avatarID": store.avatarID,
                "username": store.username,
                "language": store.language,
                "guest": store.guest,
                "level": store.level,
                "role": room.getRole(store.id),
                "gRole": store.gRole,
                "joined": store.joined,
                "id": store.id,
                "badge": store.badge,
                "slug": store.slug,
                "blurb": store.blurb,
                "sub": store.sub,
                "silver": store.silver,
                "donator": store.donator
              }
        };
        
        this.getFreePlId = () => {
            var ids = _self.store().playlists.map((playlist) => {
                return playlist.id;
            });
            var id = _self.store().id;
            while (ids.contains(id))
                id ++;
            return id;
        };
        
        this.getPlFromMediaId = (medId) => {
            return _self.store().playlists.filter((obj) => {
                var media = obj.media.filter((media) => {
                    return media.id == medId;
                })[0];
                return media;
            })[0];
        };
        
        //hacky
        this.getMedia = (id) => {
            var a = [];
            for (obj of _self.store().playlists) {
                var media = obj.media.filter((media) => {
                    return media.id == id;
                })[0];
                if (media)
                    a.push(media);
            }
            return a[0];
        };
        
        this.getPlaylistById = (id) => {
             return _self.store().playlists.filter((playlist) => {
                 return playlist.id == id;
             })[0];
        };
        
        this.upgrade = () => {
            var store = _self.store();
            const x = [0, 12, 45, 180, 1350, 3e3, 8400, 12500, 18900, 26150, 34875, 44e3, 55500, 69225, 85575, 110550, 139290, 173450, 212e3, 261575, 315e3],
                  nextXp = x.length < store.level ? 20000000 : x[store.level];


            if (store.xp > nextXp) {
                store.level ++;
                switch (store.level) {
                    case 2:
                        logger.log("Giving %s 450 pp for getting to level two", store.username);
                        store.pp += 450;
                    default:
                        logger.log("No reward found for level %s", store.level);
                }

                _self.socket.sendEvent("notify", [{
                    "action": "levelUp",
                    "id": store.id,
                    "timestamp": Date.now(),
                    "value": store.level
                }]);

                this.updateUser();
              }
        };
        
        this.updateUser = () => {
            var store = _self.store();
            var payload = {
                i: store.id,
                xp: store.xp,
                sub: store.sub,
                avatarID: store.avatarID,
                username: store.username,
                badge: store.badge,
                guest: false,
                level: store.level,
                donator: store.donator,
                silver: store.silver 
            };
            _self.getRooms().forEach((room) => {
                room.broadcast('userUpdate', payload);
            });
            _self.socket.sendEvent('userUpdate', payload);
        };
        
        this.earn = (user, xp, pp) => {
            pp = pp || 0;
            _self.store().xp += xp
            _self.store().pp += pp

            this.upgrade(user);

            if (!(user.socket))
                return;
            
            _self.socket.sendEvent("earn", {
                xp: user.store().xp,
                pp: user.store().pp,
                level: user.store().level
            })
        }

        return this;
    };
    
    this.stop = () => {
        this.sendingPings = false;
        this.socket.sendEvent('killSession', {});
        this.socket.close();
    };
    
    this.startPing = () => {
        this.sendPings = true;
        setTimeout(ping, 3000);
    }
    
    function ping() {
        if (!(this.sendingPings))
            return;
        setTimeout(ping, 3000);
        this.socket.send('h');
    }
    
    this.getRooms = () => {
        return getMain().rooms.filter((obj) => {
            return _self.rooms.contains(obj.slug);
        });
    };
    
    this.room = (callback) => {
        var room = this.rooms[this.rooms.length - 1];

        if (!(room)) {
            callback(undefined);
            return;
        }

        room = getMain().rooms.filter((obj) => {
            return obj.slug === room;
        })[0];
        
        callback(room);
    };
    
    this.store = () => {
        var _self = this;
        
        if (!(this.loggedIn)) 
            return JSON.parse('{"avatarID":"base05","badge":"80sb01","gRole":0,"guest":true,"id":13662743,"joined":1458865310774,"language":null,"level":1,"blurb":null,"slug":"guest","sub":0,"username":"guest","password":"","email":"nan","name":"guest","silver":false,"donator":0,"xp":0,"pp":0,"pw":false,"place":0,"settings":{"chatImages":true,"chatTimestamps":12,"emoji":true,"friendAvatarsOnly":false,"notifyDJ":true,"notifyFriendJoin":true,"notifyScore":true,"tooltips":true,"videoOnly":false},"ignores":[],"communities":[],"notifications":[],"favs":[],"playlists":[],"avatars":{"unlockall":false,"list":[]},"badges":{"unlockall":false,"list":[]},"history":[],"length":0,"dprg":100}');
        
        if (share)
            return share;
        
        var stores = getMain().storeSync.filter((obj) => {return obj.id === _self.accountId});
        var bestStore = stores[0];
        
        if (!(bestStore)) {
            logger.warn("No store for %s", this.accountId);
            return undefined;
        }
        
        return share = bestStore;
    };
}