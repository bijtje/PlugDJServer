var logger = require('./logger.js'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    uuid = require('node-uuid');

var Room = function (getMain, name) {
    this.name = name
    this.getMain = getMain
    this.slug = name
    this.knownUsers = []
    this.lore = 'This room doesn\'t have a welcome message.'
    this.isPlaying = false
    this.usersId = []
    this.grabs = {}
    this.mutes = []
    this.history = []
    this.bans = []
    this.iterateDJs = true
    this.creator = 'Ghost'
    this.locked = false
    this.private = false
    this.nsfw = false
    this.backlist = []
    this.creatorId = 2
    this.skipCount = 0
    this.minChatLevel = 0
    this.guests = [];
    this.votes = {}
    this.sub = 'This room doesn\'t have a description'
    this.syncTime = null
    this.cacheUsers = {
        array: [],
        needsUpdating: true
    }
    this.cachedArray = []


    this.playing = {
        media: {
            cid: 'insM7oUYNOE',
            id: 0,
            title: 'Percussive maintenance',
            author: 'Duncan Robson',
            length: 20,
            format: 1
        }
    }

    this.id = -1

    this.setSyncNow();
    this.nullPlaying();
};

Room.prototype.users = function () {
    var _self = this;
    if (this.cacheUsers.needsUpdating) {
        this.cacheUsers.array = this.getMain().sessions.filter(function (session) {
            return session.rooms && session.rooms.contains(_self.slug);
        });
        this.cacheUsers.needsUpdating = false;
    }
    return this.cacheUsers.array;
};


Room.prototype.usersById = function (id) {
    var _self = this;
    return this.users().filter(function (session) {
        return session.store().id === id;
    });
};

Room.prototype.setSyncNow = function () {
    this.syncTime = Date.now();
};


Room.prototype.vote = function (user, dir, credit) {
    var _self = this;
    var store = user.store();
    var config = this.getMain().config;
    var id = parseInt(store.id);
    
    this.votes[id] = dir;


    this.broadcast('vote', {
        'i': id,
        'v': dir
    });

    var downs = this.getCleanVotes().down;
    var alg = ((downs > this.usersId.length / 2.333333333333333) && (downs > 2));

    if (alg)
        this.stopPlaying();

    if (credit)
        return;

    if (this.votes[id])
        return;

    user.utilUser().earn(user, config.xp.woot,
        user.level * 2 + config.xp.pp);

};

Room.prototype.disableWaitlist = function (shouldRemove, id, name) {
    this.locked = true
    this.broadcast('djListLocked', {
        'c': shouldRemove,
        'f': true,
        'm': name,
        'mi': id
    });
};

Room.prototype.enableWaitlist = function (id, name) {
    this.locked = false
    this.broadcast('djListLocked', {
        'c': false,
        'f': false,
        'm': name,
        'mi': id
    });
};

Room.prototype.getCleanVotes = function () {
    var _self = this;
    var votes = {
        white: 0,
        down: 0,
        up: 0
    };

    Object.keys(this.votes).forEach(function (voter) {
        var value = _self.votes[voter]
        switch (value) {
            case -1:
                votes.down++
                    break;
            case 0:
                votes.white++;
                break;
            case 1:
                votes.up++;
                break;
            default:
                break;
        }
    });

    votes.white = _self.grabs.length;

    return votes;
};

Room.prototype.getWaitingDJs = function () {
    return this.backlist.map(function (obj) {
        return obj.dj.store().id;
    });
}

Room.prototype.getRole = function (userId) {
    var match = this.knownUsers.filter(function (sto) {
        return sto.id === userId;
    })[0];

    return match ? match.role : 0;
};

Room.prototype.changeName = function (name, id) {
    this.name = name;
    this.broadcast('roomNameUpdate', {
        n: name,
        u: id
    });
};

Room.prototype.editDescription = function (des, id) {
    this.sub = des;
    this.broadcast('roomDescriptionUpdate', {
        d: des,
        u: id
    });
};

Room.prototype.editWelcome = function (welcome, id) {
    this.lore = welcome;
    this.broadcast('roomWelcomeUpdate', {
        w: welcome,
        u: id
    });
};

Room.prototype.start = function (playable, rankup) {
    var _self = this;
    this.setSyncNow();
    playable.uid = uuid.v4();

    var dj = playable.dj;
    var djStore = dj.store();

    this.isPlaying = true;
    this.votes = {};
    this.grabs = {};
    this.playing = playable;

    setTimeout(function () {
        if (_self.playing.uid === playable.uid)
            _self.stopPlaying(false, false, true)
    }, (playable.duration + 5) * 1000);

    this.broadcast('advance', {
        'c': playable.dj.store().id,
        'd': this.getWaitingDJs(),
        'h': this.playing.uid,
        'm': this.playing.media,
        'p': this.playing.plId,
        't': this.syncTime
    });


    this.vote(playable.dj, 1, rankup);

    if (!(rankup))
        playable.dj.utilUser().earn(dj,
            this.getMain().config.xp.dj,
            djStore.level * 2 + this.getMain().config.pp.dj);


    this.users().forEach((user) => {
        user.utilUser().earn(user,
            this.getMain().config.xp.advance,
            user.store().level * 2 + this.getMain().config.pp.advance);
    })

    logger.log(util.format('Playing %s in %s', playable.media.title, this.slug));
}

Room.prototype.attemptSkip = function (userId) {
    if (!(this.playing.dj && (this.playing.dj.store().id === userId) || (this.getRole(userId) > 1)))
        return false
    this.stopPlaying();
    return true;
};

Room.prototype.updateGuestCount = function (dir, session) {
    var id = Math.getRandom(400000, 90000000);
    var tempStore = session.store();

    tempStore.id = id;

    if (dir) {
        this.guests.push(tempStore);
        this.broadcast('userJoin', tempStore);
        this.cacheUsers.needsUpdating = true;
    } else {
        this.broadcast('userLeave', 0);
        this.guests.splice(0, 1);
    }
};

Room.prototype.nullPlaying = function () {
    this.isPlaying = false;
    this.playing = {
        dj: {
            user: {
                id: null
            },
            store: function () {
                return {};
            }
        },
        media: this.playing.media
    };
};

Room.prototype.stopPlaying = function (justStarted, skipped, success) {
    var djStore = this.playing.dj.store();
    var votes = this.getCleanVotes();
    var data = {
        id: this.playing.uid,
        media: this.playing.media,
        room: {
            name: this.name,
            slug: this.slug
        },
        score: {
            grabs: votes.white,
            listeners: this.usersId.length,
            negative: votes.down,
            positive: votes.up,
            skipped: skipped
        },
        timestamp: this.syncTime,
        user: {
            id: djStore.id,
            username: djStore.username
        }
    };

    this.history.push(data);
    if (this.history.length > 40)
        this.history.splice(0, 1);

    if (!(justStarted)) {
        var djHis = djStore.history;
        this.playing.dj.store().history = djHis || [];
        djHis.push(data);

        if (djHis.length > 40)
            djHis.splice(0, 1);
    }


    this.votes = {};
    this.isPlaying = false;
    this.skipCount = 0;

    if (success) {
        if (this.iterateDJs) {
            var back = this.backlist[0];
            if (back) {
                remove(this.backlist, back);
                this.start(back);
                return
            }
        } else {
            this.skipSong(this.playing.dj, true);
            return;
        }
    }


    this.broadcast('advance', {});

    this.nullPlaying();
};

Room.prototype.removeMessage = function (cid, remover) {
    this.broadcast('chatDelete', {
        'c': cid,
        'mi': remover
    });
};

Room.prototype.warnUserForSpamming = function (user) {
    user.socket.sendEvent('betterAlert', {
        message: 'Just watch ya fucking requests',
        level: 'error'
    });
    user.socket.sendEvent('betterAlert', {
        message: 'Are you abusing a bot?',
        level: 'error'
    });
    user.socket.sendEvent('betterAlert', {
        message: 'You are already in the waitlist!',
        level: 'error'
    });
}

Room.prototype.attemptRemoveWaitlist = function (id) {
    logger.log(util.format('Trying to remove %s from the waitlist in %s', id, this.slug));
    this.backlist.forEach(function (back) {
        if (back.dj.store().id == /*=*/ id) {
            remove(this.backlist, back);
            this.broadcast('djListUpdate', this.getWaitingDJs());
            return;
        }
    });
};

Room.prototype.processWaitlistFromUser = function (user, forced) {
    var _self = this;
    logger.log(util.format('Adding %s into the waitlist of %s', user.store().username, this.slug))

    var store = user.store();

    if (!(forced)) {
        if ((this.locked) &&
            (!((this.getRole(store.id) > 0) || (store.gRole > 2))))
            return;

        if (this.getWaitingDJs().contains(store.id) || this.playing.dj.store().id === store.id) {
            this.warnUserForSpamming(user);
            return;
        }
    }
    store.playlists.filter(function (obj) {
        return obj.active;
    }).forEach(function (playlist) {
        if (playlist.media.length - 1 < store.place)
            user.store().place = 0;

        var media = playlist.media[store.place];
        var playable = {
            dj: user,
            title: media.title,
            author: media.author,
            duration: media.duration,
            plId: playlist.id,
            media: media,
            uid: Date.now()
        };

        if (_self.isPlaying) {
            _self.backlist.push(playable);
            _self.broadcast('djListUpdate', _self.getWaitingDJs());
        } else {
            _self.start(playable);
        }

        store.place++;
    });
}

//This will skip to the next playlist entry 
//Not yet implemented in reguar plug
Room.prototype.skipSong = function (user, ignore) {
    var _self = this;
    var store = user.store();
    if (!(ignore))
        this.skipCount++

        if (this.skipCount > 2) {
            this.playing.dj.socket.sendEvent('betterAlert', {
                message: 'Piss off!',
                level: 'error'
            });
            return;
        }

    if (!((this.playing.dj.store().id === store.id) || (this.getRole(store.id) > 2)))
        return;

    store.playlists.filter(function (obj) {
        return obj.active;
    }).forEach(function (playlist) {
        if (playlist.media.length - 1 < store.place)
            store.place = 0;

        var media = playlist.media[store.place];

        var playable = {
            dj: user,
            plId: playlist.id,
            title: media.title,
            author: media.author,
            duration: media.duration,
            media: media,
            uid: Date.now()
        };

        _self.start(playable, true);

        store.place++;
    })
}

Room.prototype.addUser = function (newSess) {
    var _self = this;
    this.bcJoinPayload(newSess);

    if (this.usersId.contains(newSess.store().id)) {
        logger.warn('Prevented double join!');
        return;
    };

    this.cacheUsers.needsUpdating = true;
    this.usersId.push(newSess.store().id);
}

Room.prototype.leave = function (id) {
    var _self = this;
    remove(this.usersId, id);

    this.getMain().sessions.filter(function (session) {
        if (session.accountId === id)
            session.rooms.removeEntry(_self.slug);
    });

    this.cacheUsers.needsUpdating = true;
    this.broadcast('userLeave', id);
};

Room.prototype.broadcast = function (name, data) {
    var _self = this;
    this.users().forEach(function (user) {
        user.socket.sendEvent(name, data);
    });
};

Room.prototype.sendMessage = function (message, user) {
    var _self = this;
    logger.log(util.format('%s|%s > ', this.slug, user.username, message))

    if (/*((this.minChatLevel === 1) 
         ||((this.minChatLevel === 2) && (this.getRole(user.id) > 0)) 
         || ((this.minChatLevel === 3) && (this.getRole(user.id) > 3)) 
         || (user.gRole > 1))
         && */(!(this.isMuted(user.id)))) {

        this.broadcast('chat', {
            'cid': util.format('%s-%s',
                Math.getRandom(1000000, 9999999),
                Date.leg_now()),
            'message': message,
            'sub': user.sub,
            'uid': user.id,
            'un': user.username
        });
    }
}

Room.prototype.isMuted = function (id) {
    var _self = this;
    var mute = this.mutes.filter(function (mute) {
        return mute.id == id
    })[0];
    
    if (!(mute))
        return false;

    if (Math.round((( mute.date - Date.leg_now()))) < 0) {
        remove(this.mutes, mute)
        return false;
    }
    return true;
};

Room.prototype.isBanned = function (id) {
    var _self = this;
    var ban = this.bans.filter(function (bans) {
        return bans.id == id
    })[0];

    if (!(ban))
        return false;
    
    if (Math.round(((ban.date - Date.leg_now()))) < 0) {
        remove(this.bans, ban)
        return false;
    }
    return ban;
};


Room.prototype.load = function () {
    var _self = this;
    var data = JSON.parse(bufferFile(getPath(this.name)).toString('utf8'))

    Object.keys(data).forEach(function (attrname) {
        _self[attrname] = data[attrname]
    });

    if (this.id === -1) {
        this.id = getFiles('./rooms/').length
        this.save()
    }

    var adminAbuse = {
        id: 2,
        role: 5
    }

    var foundGhost = this.knownUsers.filter(function (obj) {
        return obj.id == 2;
    }).length > -1;

    if (!(foundGhost))
        this.knownUsers.push(adminAbuse);

    this.stopPlaying(true);
    this.usersId = [];
}


var getPath = function (name) {
    return './rooms/' + name + '.json'
}

Room.prototype.getSafeUsers = function () {
    var _self = this;
    return this.users().filter(function (session) {
        return session.loggedIn;
    }).map(function (session) {
        var store = session.store();
        return {
            avatarID: store.avatarID,
            pp: store.pp,
            badge: store.badge,
            gRole: store.gRole,
            id: store.id,
            joined: store.joined,
            level: store.level,
            role: _self.getRole(store.id),
            sub: store.sub,
            blurb: store.blurb,
            username: store.username,
            slug: store.slug,
            silver: store.silver,
            donator: store.donator
        };
    });
}

Room.prototype.save = function () {
    var _self = this;
    try {
        logger.debug('Saving room %s', _self.name);

        if (_self.id < 0)
            _self.id = getFiles('./rooms/').length + 69420;

        fs.writeFileSync(getPath(_self.name), JSON.stringify({
            slug: _self.slug,
            knownUsers: _self.knownUsers,
            name: _self.name,
            mutes: _self.mutes,
            bans: _self.bans,
            iterateDJs: _self.iterateDJs,
            locked: _self.locked,
            minChatLevel: _self.minChatLevel,
            creator: _self.creator,
            creatorId: _self.creatorId,
            sub: _self.sub,
            lore: _self.lore,
            id: _self.id,
            nsfw: _self.nsfw
        }));

    } catch (e) {
        logger.warn('Failed to save room! %s', this.slug)
    }
};

Room.prototype.bcJoinPayload = function (newSess) {
    this.broadcast('userJoin', newSess.utilUser().getSPayload(this));
};

Room.prototype.getSPayload = function (store) {
    var _self = this;
    return {
        capacity: null,
        cid: _self.playing.media.cid,
        dj: _self.isPlaying ? _self.playing.dj.store().id : null,
        favorite: (store.favs.contains(_self.name)) || store.favs.contains(this.id),
        format: _self.isPlaying ? _self.playing.media.format : 1,
        guests: _self.guests.length,
        host: _self.creator,
        id: _self.id,
        image: 'https://i.ytimg.com/vi/' + _self.playing.media.cid + '/hqdefault.jpg',
        media: _self.playing.media.title + ' by ' + _self.playing.media.author,
        name: _self.name,
        nsfw: false,
        population: _self.usersId.length,
        slug: _self.slug
    };
};

Room.prototype.getPayload = function (store) {
    var _self = this;
    return {
        booth: {
            currentDJ: _self.isPlaying ? _self.playing.dj.store().id : null,
            isLocked: _self.locked,
            shouldCycle: _self.iterateDJs,
            waitingDJs: _self.getWaitingDJs()
        },
        fx: [],
        grabs: _self.grabs,
        meta: {
            description: _self.sub,
            favorite: (store.favs.contains(_self.name)) || store.favs.contains(_self.id),
            guests: _self.guests.length,
            hostID: _self.creatorid,
            hostName: _self.creator,
            id: _self.id,
            minChatLevel: 1,
            name: _self.name,
            population: _self.usersId.length,
            slug: _self.slug,
            welcome: _self.lore
        },
        mutes: _self.mutes,
        playback: {
            historyID: _self.slug,
            playlistID: _self.isPlaying ? _self.playing.plId : _self.slug,
            startTime: _self.syncTime,
            media: _self.isPlaying ? {
                author: _self.playing.media.author,
                title: _self.playing.media.title,
                cid: _self.playing.media.cid,
                duration: _self.playing.media.duration,
                format: _self.playing.media.format,
                id: _self.playing.media.id,
                image: _self.playing.media.image
            } : null
        },
        role: _self.getRole(store.id),
        users: _self.getSafeUsers(),
        votes: _self.votes
    };
};


function getFiles(srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
        return (!(fs.statSync(path.join(srcpath, file)).isDirectory()))
    })
}


function bufferFile(relPath) {
    return fs.readFileSync(relPath)
}

function remove(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}

module.exports = Room;
