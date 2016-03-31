var logger = require('./logger.js'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    uuid = require('node-uuid')
    /*****



    THIS FUNCTION IS UNDER RECONSTRUCTION
    POC CODE BELOW





    */
module.exports = function (getMain, name) {
    this.name = name
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
        dj: {
            user: {
                id: null
            },
            store: () => {
                return {};
            }
        },
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

    var _self = this

    this.users = () => {
        if (this.cacheUsers.needsUpdating) {
            this.cacheUsers.array = getMain().sessions.filter((session) => {
                return session.rooms && session.rooms.contains(_self.slug)
            });
            this.cacheUsers.needsUpdating = false;
        }
        return this.cacheUsers.array;
    }


    this.usersById = (id) => {
        return this.users().filter((session) => {
            return session.store().id === id
        })
    }

    this.setSyncNow = () => {
        this.syncTime = Date.now()
    }

    this.setSyncNow()

    this.vote = (user, dir, credit) => {
        if (!(credit))
            if (!(this.votes[parseInt(user.store().id)]))
                user.utilUser().earn(user, getMain().config.xp.woot,
                                     user.store().level * 2 + getMain().config.xp.pp)


        this.votes[parseInt(user.store().id)] = dir

        this.broadcast('vote', {
            'i': user.store().id,
            'v': dir
        })

        var downs = this.getCleanVotes().down
        var alg = ((downs > this.usersId.length / 2.333333333333333) 
                   && (downs > 2))

        if (alg)
            this.stopPlaying()
    }


    this.disableWaitlist = (shouldRemove, id, name) => {
        this.locked = true
        this.broadcast('djListLocked', {
            'c': shouldRemove,
            'f': true,
            'm': name,
            'mi': id
        })
    }

    this.enableWaitlist = (id, name) => {
        this.locked = false
        this.broadcast('djListLocked', {
            'c': false,
            'f': false,
            'm': name,
            'mi': id
        })
    }

    this.getCleanVotes = () => {
        var votes = {
            white: 0,
            down: 0,
            up: 0
        }

        Object.keys(this.votes).forEach((voter) => {
            var value = _self.votes[voter]
            switch (value) {
                case -1:
                    votes.down++
                    break;
                case 0:
                    votes.white ++;
                    break;
                case 1:
                    votes.up ++;
                    break;
                default:
                    break;
            }
        });

        votes.white = _self.grabs.length

        return votes
    }


    this.getWaitingDJs = () => {
        return this.backlist.map((obj) => {
            return obj.dj.store().id
        })
    }

    this.getRole = (userId) => {
        var match = this.knownUsers.filter((sto) => {
            return sto.id === userId
        });

        if (match.length > 0)
            return match[0].role
        else
            return 0
    }

    this.changeName = (name, id) => {
        this.name = name
        this.broadcast('roomNameUpdate', {
            n: name,
            u: id
        })
    }

    this.editDescription = (des, id) => {
        this.sub = des
        this.broadcast('roomDescriptionUpdate', {
            d: des,
            u: id
        })
    }

    this.editWelcome = (welcome, id) => {
        this.lore = welcome
        this.broadcast('roomWelcomeUpdate', {
            w: welcome,
            u: id
        })
    }

    this.start = (playable, rankup) => {
        this.setSyncNow()
        playable.uid = uuid.v4()

        var dj = playable.dj;
        var djStore = dj.store();

        this.isPlaying = true
        this.votes = {}
        this.grabs = {}
        this.playing = playable

        setTimeout(function () {
            if (_self.playing.uid === playable.uid)
                _self.stopPlaying(false, false, true)
        }, playable.duration * 1000)

        this.broadcast('advance', {
            'c': playable.dj.store().id,
            'd': this.getWaitingDJs(),
            'h': this.playing.uid,
            'm': this.playing.media,
            'p': this.playing.plId,
            't': this.syncTime
        })


        this.vote(playable.dj, 1, rankup)

        if (!(rankup))
            playable.dj.utilUser().earn(dj,
                getMain().config.xp.dj,
                djStore.level * 2 + getMain().config.pp.dj);


        this.users().forEach((user) => {
            user.utilUser().earn(user,
                getMain().config.xp.advance,
                user.store().level * 2 + getMain().config.pp.advance);
        })

        logger.log(util.format('Playing %s in %s', playable.media.title, this.slug))
    }

    this.attemptSkip = (userId) => {
        if (!(this.playing.dj && (this.playing.dj.store().id === userId) || (this.getRole(userId) > 1)))
            return false
        this.stopPlaying()
        return true
    }

    this.updateGuestCount = (dir, session) => {
        var id = Math.getRandom(400000, 90000000);
        var tempStore = session.store();

        tempStore.id = id;

        if (dir) {
            this.guests.push(tempStore);
            this.broadcast('userJoin', tempStore);
            this.cacheUsers.needsUpdating = true;
        } else {
            //TODO Find a safer id... some guests may deem the leave payload as theirself
            this.broadcast('userLeave', this.guests[0])
            this.guests.splice(0, 1);
        }
    }

    this.stopPlaying = (justStarted, skipped, success) => {
        var djStore = this.playing.dj.store();
        const votes = this.getCleanVotes()
        const data = {
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
        }

        this.history.push(data)
        if (this.history.length > 40)
            this.history.splice(0, 1)

        if (!(justStarted)) {
            var djHis = djStore.history
            this.playing.dj.store().history = djHis || []
            djHis.push(data)

            if (djHis.length > 40)
                djHis.splice(0, 1)

        }


        this.votes = {}
        this.isPlaying = false
        this.skipCount = 0

        if (success) {
            if (this.iterateDJs) {
                var back = this.backlist[0];
                if (back) {
                    remove(this.backlist, back)
                    this.start(back)
                    return
                }
            } else {
                this.skipSong(this.playing.dj, true)
                return
            }
        }


        this.broadcast('advance', {})

        this.playing = {
            dj: {
                user: {
                    id: null
                },
                store: () => {
                    return {};
                }
            },
            media: this.playing.media
        }
    }

    this.removeMessage = (cid, remover) => {
        this.broadcast('chatDelete', {
            'c': cid,
            'mi': remover
        })
    }

    this.warnUserForSpamming = (user) => {
        user.socket.sendEvent('betterAlert', {
            message: 'Just watch ya fucking requests',
            level: 'error'
        })
        user.socket.sendEvent('betterAlert', {
            message: 'Are you abusing a bot?',
            level: 'error'
        })
        user.socket.sendEvent('betterAlert', {
            message: 'You are already in the waitlist!',
            level: 'error'
        })
    }
    this.attemptRemoveWaitlist = (id) => {
        logger.log(util.format('Trying to remove %s from the waitlist in %s', id, this.slug));
        this.backlist.forEach((back) => {
            if (back.dj.store().id == /*=*/ id) {
                remove(this.backlist, back);
                this.broadcast('djListUpdate', this.getWaitingDJs());
                return;
            }
        });
    };

    this.processWaitlistFromUser = (user, forced) => {
        logger.log(util.format('Adding %s into the waitlist of %s', user.store().username, this.slug))
        if (!(forced)) {
            if ((this.locked) &&
                (!((this.getRole(user.store().id) > 0) || (user.store().gRole > 2))))
                return

            if (this.getWaitingDJs().contains(user.store().id) || this.playing.dj.store().id === user.store().id) {
                this.warnUserForSpamming(user)
                return
            }
        }
        user.store().playlists.filter((obj) => {
            return obj.active;
        }).forEach((playlist) => {
            if (playlist.media.length - 1 < user.store().place)
                user.store().place = 0

            var media = playlist.media[user.store().place]
            var playable = {
                dj: user,
                title: media.title,
                author: media.author,
                duration: media.duration,
                plId: playlist.id,
                media: media,
                uid: Date.now()
            }

            if (_self.isPlaying) {
                _self.backlist.push(playable)
                _self.broadcast('djListUpdate', _self.getWaitingDJs())
            } else {
                _self.start(playable)
            }

            user.store().place++
        });
    }

    //This will skip to the next playlist entry 
    //Not yet implemented in reguar plug
    this.skipSong = (user, ignore) => {
        if (!(ignore))
            this.skipCount++

            if (this.skipCount > 2) {
                this.playing.dj.socket.sendEvent('betterAlert', {
                    message: 'Piss off!',
                    level: 'error'
                })
                return
            }

        if (!((this.playing.dj.store().id === user.store().id) || (this.getRole(user.store().id) > 2)))
            return

        user.store().playlists.filter((obj) => {
            return obj.active
        }).forEach((playlist) => {
            if (playlist.media.length - 1 < user.store().place)
                user.store().place = 0

            var media = playlist.media[user.store().place]

            var playable = {
                dj: user,
                plId: playlist.id,
                title: media.title,
                author: media.author,
                duration: media.duration,
                media: media,
                uid: Date.now()
            }

            _self.start(playable, true)

            user.store().place++
        })
    }

    this.addUser = (newSess) => {
        this.bcJoinPayload(newSess)

        if (this.usersId.contains(newSess.store().id)) {
            logger.warn('Prevented double join!')
            return
        }
        
        this.cacheUsers.needsUpdating = true;
        this.usersId.push(newSess.store().id)
    }

    this.leave = (id) => {
        remove(this.usersId, id);

        getMain().sessions.filter((session) => {
            if (session.accountId === id)
                remove(session.rooms, _self.slug)
        })

        this.cacheUsers.needsUpdating = true;
        this.broadcast('userLeave', id)
    }

    this.broadcast = (name, data) => {
        for (user of this.users())
            user.socket.sendEvent(name, data)
    }


    this.sendMessage = (message, user) => {
        logger.log(util.format('%s|%s > ', this.slug, user.username, message))

        if (
            /*((this.minChatLevel === 1) ||
                        ((this.minChatLevel === 2) || (this.getRole(user.id) > 0)) ||
                        ((this.minChatLevel === 3) || (this.getRole(user.id) > 3)) ||
                        (user.gRole > 1))
                        &&*/
            (!(this.isMuted(user.id)))) {

            this.broadcast('chat', {
                'cid': util.format('%s-%s',
                    Math.getRandom(1000000, 9999999),
                    Date.leg_now()),
                'message': message,
                'sub': user.sub,
                'uid': user.id,
                'un': user.username
            })
        }
    }

    this.isMuted = (id) => {
        var mutes = this.mutes.filter((mute) => {
            return mute.id === id
        });

        var mute = mutes[0]

        if (!(mute))
            return false;

        if (((mute.date - Date.leg_now()) / 1000) < 0) {
            remove(this.mutes, mute)
            return false;
        }
        return true;
    };

    this.isBanned = (id) => {
        var bans = this.bans.filter((bans) => {
            return bans.id === id
        });

        var ban = bans[0]

        if (!(ban))
            return false;

        if (((ban.date - Date.leg_now()) / 1000) < 0) {
            remove(this.bans, ban)
            return false;
        }
        return ban;
    };


    this.load = () => {
        logger.log(getPath());
        var data = JSON.parse(bufferFile(getPath()).toString('utf8'))

        for (attrname in data)
            this[attrname] = data[attrname]

        if (this.id === -1) {
            this.id = getFiles('./rooms/').length
            this.save()
        }

        var adminAbuse = {
            id: 2,
            role: 5
        }

        var foundGhost = this.knownUsers.filter((obj) => {
            return obj.id == 2
        }).length > -1

        if (!(foundGhost))
            this.knownUsers.push(adminAbuse)

        this.stopPlaying(true)
        this.usersId = []
    }


    var getPath = function () {
        return './rooms/' + name + '.json'
    }

    this.getSafeUsers = () => {
        return this.users().filter((session) => {
            return session.loggedIn;
        }).map((session) => {
            var store = session.store();
            return {
                avatarID: store.avatarID,
                pp: store.pp,
                badge: store.badge,
                gRole: store.gRole,
                id: store.id,
                joined: store.joined,
                level: store.level,
                role: this.getRole(store.id),
                sub: store.sub,
                blurb: store.blurb,
                username: store.username,
                slug: store.slug,
                silver: store.silver,
                donator: store.donator
            };
        });
    }

    this.save = () => {
        try {
            logger.debug('Saving room ' + name)

            if (this.id < 0)
                this.id = getFiles('./rooms/').length

            fs.writeFileSync(getPath(), JSON.stringify({
                slug: this.slug,
                knownUsers: this.knownUsers,
                name: this.name,
                mutes: this.mutes,
                bans: this.bans,
                iterateDJs: this.iterateDJs,
                locked: this.locked,
                minChatLevel: this.minChatLevel,
                creator: this.creator,
                creatorId: this.creatorId,
                sub: this.sub,
                lore: this.lore,
                id: this.id,
                nsfw: this.nsfw
            }))

        } catch (e) {
            logger.warn('Failed to save room! %s', this.slug)
        }
    }

    this.bcJoinPayload = (newSess) => {
        this.broadcast('userJoin', newSess.utilUser().getSPayload(this))
    }

    this.getSPayload = (store) => {
        return {
            capacity: null,
            cid: this.playing.media.cid,
            dj: this.isPlaying ? this.playing.dj.store().id : null,
            favorite: (store.favs.contains(this.name)) || store.favs.contains(this.id),
            format: this.isPlaying ? this.playing.media.format : 1,
            guests: this.guests.length,
            host: this.creator,
            id: this.id,
            image: 'https://i.ytimg.com/vi/' + this.playing.media.cid + '/hqdefault.jpg',
            media: this.playing.media.title + ' by ' + this.playing.media.author,
            name: this.name,
            nsfw: false,
            population: this.usersId.length,
            slug: this.slug
        }
    }

    this.getPayload = (store) => {
        return {
            booth: {
                'currentDJ': this.isPlaying ? this.playing.dj.store().id : null,
                'isLocked': this.locked,
                'shouldCycle': this.iterateDJs,
                'waitingDJs': this.getWaitingDJs()
            },
            fx: [],
            grabs: this.grabs,
            meta: {
                description: this.sub,
                favorite: (store.favs.contains(this.name)) || store.favs.contains(this.id),
                guests: this.guests.length,
                hostID: this.creatorid,
                hostName: this.creator,
                id: this.id,
                minChatLevel: 1,
                name: this.name,
                population: this.usersId.length,
                slug: this.slug,
                welcome: this.lore
            },
            mutes: this.mutes,
            playback: {
                historyID: this.slug,
                playlistID: this.isPlaying ? this.playing.plId : this.slug,
                startTime: this.syncTime,
                media: this.isPlaying ? {
                    author: this.playing.media.author,
                    title: this.playing.media.title,
                    cid: this.playing.media.cid,
                    duration: this.playing.media.duration,
                    format: this.playing.media.format,
                    id: this.playing.media.id,
                    image: this.playing.media.image
                } : null
            },
            role: this.getRole(store.id),
            users: this.getSafeUsers(),
            votes: this.votes
        }

    }
}


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
