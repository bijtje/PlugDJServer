var Framework = require('./framework.js'),
    WebHandler = require('./webHandler.js'),
    fs = require('fs'),
    sizeOf = require('image-size'),
    Room = require('./room.js'),
    userstore = require('./userstore.js'),
    SocketHandler = require('./socketHandler.js'),
    logger = require('./logger.js');

var program = {};
var main = {
    rooms: [],
    sessions: [],
    storeSync: [],
    saving: false,
    getSTO: function () { 
        return require('./userstore.js').getUserSync('users').list; 
    },
    login: function (session, email, cb) {
        session.loggedIn = true;
        userstore.getUser(email, (profile) => {
            session.accountId = profile.id;
            if (main.sessions.map((obj) => {return obj.id}).contains(profile.id)) {
                logger.warn('%s is already loaded!', obj.email);
            } else {
                main.storeSync.push(profile);
                logger.log('Loaded user into memory!');
            }
            cb();
        });
    }
    
};


program.onStopping = () => {
    main.sessions.forEach((session) => {
        session.socket.sendEvent('plugMaintenance', {}); 
    });
    save();
    return true;
};

program.onLaunch = (error) => {
    logger.info('Starting up.');
    setupConfig();
    loadRooms();
    setTimeout(saveLoop, 15 * 1000 * 60);
    new WebHandler(() => {
        return main;
    });
    new SocketHandler(() => {
        return main;
    });
    logger.info('Ready!');
};

function loadRooms() {
    fs.readdir('./rooms/', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            if (!(file.endsWith('.json')))
                return;
            var room = new Room(() => {
                return main;
            }, file.toString().before('.json'));
            room.load();
            main.rooms.push(room);
            logger.log('Loaded room ' + room.name);
        });
    });
};

function saveLoop() {
    setTimeout(saveLoop, 15 * 1000 * 60);
    save();
}

function save() {
    if (main.saving) return;
    main.saving = true;
    logger.log('Saving users');
    for (usr of main.storeSync) 
        userstore.saveUser(usr);
    logger.log('Saving rooms');
    for (room of main.rooms) 
        room.save();
    main.saving = false;
    logger.log('Done!');
}

function setupConfig() {
    main.avatars = JSON.parse(fs.readFileSync('./avatars.json', {
        encoding: 'utf8'
    }));
    
    main.badges = JSON.parse(fs.readFileSync('./badges.json', {
        encoding: 'utf8'
    })).list;
    
    var raw = JSON.parse(fs.readFileSync('./config.json', {
        encoding: 'utf8'
    }));
    
    var conf = {};
    for (attrname in raw)
        conf[attrname] = raw[attrname]
        
    conf.theme = {};
    conf.theme.player = raw.theme + '.png';
    conf.theme.background = raw.theme + '.jpg';
    
    sizeOf('assets/images/community/' + conf.theme.player,
            (err, dimensions) => {
        conf.theme.framew = dimensions.width;
        conf.theme.frameh = dimensions.height;
    });
    
    main.config = conf;
    
}

new Framework(program, false);