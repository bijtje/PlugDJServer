var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var url = con.url;
    var session = con.session;
    var store = session.store();
    var utilUser = session.utilUser();
    var split = url.split('/');
    var size = split.length;
    
    switch (con.method) {
        case 'GET':
            if (size === 5) 
                if (split[split.length - 1] === 'media') 
                    getMedia();
            break;
        case 'POST':
            if (size === 5) {
                if (split[split.length - 1] === 'rename') 
                    postRename();
                if (split[split.length - 1] === 'shuffle') 
                    postShuffle();
            }
            if (size === 6) {
                if (split[split.length - 1] === 'insert') 
                    postInsertMedia();
                if (split[split.length - 1] === 'delete') 
                    postDeleteMedia();
            }
            break;
        case 'DELETE': 
            if (size === 4) 
                deletePlaylist();
            break;
        case 'PUT':
            if (size === 5) {
                if (split[split.length - 1] === 'activate') 
                    putActivate();
                if (split[split.length - 1] === 'shuffle') 
                    postShuffle();
            }
            if (size === 6) {
                if (split[split.length - 1] === 'update') 
                    putMediaUpdate();
                if (split[split.length - 1] === 'move') 
                    putMoveMedia();
            }
            break;
        default:
            break;
    }
    
    function postShuffle() {
        var pid = split[split.length - 2];
        var playlist = utilUser.getPlaylistById(pid);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        playlist.media = playlist.media.sort((a, b) => {
            return Math.getRandom(0, 3) > Math.getRandom(0, 3); 
        });
        res.ends(playlist.media);
    }
    
    function postDeleteMedia() {
        var pid = split[split.length - 3];
        var playlist = utilUser.getPlaylistById(pid);
        
        if (!(data.ids)) {
            res.ends(['Missing ids field'], 400, 'Bad request');
            return;
        }
        
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        
        var id = data.ids[0];
        var media = playlist.media;
        
        media.splice(media.indexOf(utilUser.getMedia(id)), 1);
        playlist.count = media.length;
        
        res.ends(media);
    }
    
    function putMoveMedia() {
        var pid = split[split.length - 3];
        var playlist = utilUser.getPlaylistById(pid);
        var bid = data.beforeID;
        var id = data.ids[0];
            
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        
        if (!((typeof bid) === 'number')) {
            res.ends(['Missing bid'], 400, 'Bad request');
            return;
        }
        
        if (!((typeof id) === 'number')) {
            res.ends(['Missing id'], 400, 'Bad request');
            return;
        }
        
        var index = playlist.media.length - 1;
        
        if (!(bid === -1)) 
            index = playlist.media.indexOf(utilUser.getMedia(bid));

        var item = utilUser.getMedia(id);
        
        if (!(item)) {
            res.ends(['Item not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        
        var oldIndex = playlist.media.indexOf(item);
        
        logger.debug('Old index %s, new index %s', oldIndex, index);
        playlist.media.move(oldIndex, index);
        
        res.ends(playlist.media);
    }
    
    function putMediaUpdate() {
        var id = split[split.length - 3];
        var playlist = utilUser.getPlaylistById(id);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        
        if (!(data.id)) {
            res.ends(['Missing id'], 400, 'Bad request');
            return;
        }
        
        var media = playlist.media.filter((media) => {
            return media.id === data.id;
        })[0];
        
        if (!(media)) {
            res.ends(['Media not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        }
        
        media.title = data.title ? data.title : media.title;
        media.author = data.author ? data.author : media.author;
        //media.author = data.author || media.author;
        
        res.ends([media]);
    }
    
    function putActivate() {
        var id = split[split.length - 2];
        var playlist = utilUser.getPlaylistById(id);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        
        var activePls = store.playlists.filter((pl) => {return pl.active;});
        activePls.forEach((pl) => {
            pl.active = false;
        });
        
        var deactId = activePls[0] ? activePls[0].id : undefined;
        
        playlist.active = true;
        
        res.ends([{activated: id, deactivated: deactId}]);
    }
    
    function postInsertMedia() {
        var playlist = utilUser.getPlaylistById(split[split.length - 3]);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        var mediaIds = playlist.media.map((media) => {return media.id;});
        data.media.forEach((media) => {
            while (mediaIds.contains(media.id))
                media.id++;
        });
        playlist.media = playlist.media.concat(data.media);
        playlist.count = playlist.media.length;
        res.ends([{count: playlist.count, id: playlist.id}]);
    }
    
    function deletePlaylist() {
        var playlist = utilUser.getPlaylistById(split[split.length - 1]);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        remove(store.playlists, playlist);
        res.ends(store.playlists);
    }
    
    function postRename() {
        var playlist = utilUser.getPlaylistById(split[split.length - 2]);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        if (!(data.name)) {
            res.ends(['Missing name'], 400, 'bad request');
            return;
        }
        playlist.data = name;
        res.ends(playlist);
    }
    
    function getMedia() {
        var playlist = utilUser.getPlaylistById(split[split.length - 2]);
        if (!(playlist)) {
            res.ends(['Playlist not found (unlike plug, ids are per user)'], 404, 'not found');
            return;
        } 
        res.ends(playlist.media);
    }
}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}