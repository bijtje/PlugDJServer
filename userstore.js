var logger = require('./logger.js'),
    fs = require('fs'),
    md5 = require('md5'),
    path = require('path');

module.exports = new function() {
    this.userExists = function(email) {
        try {
            fs.accessSync(getPath(email), fs.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    };

    this.getUser = function(email, callback) {
        logger.log('Loading info for ' + email);
        fs.readFile(getPath(email), 'utf8', function(err, contents) {
            callback(JSON.parse(contents));
        });
    };

    this.isValid = function(email, ipass) {
        try {
            return this.getUserSync(email).password === md5(ipass);
        }catch (e) {
            return false;
        }
    };


    this.getUserSync = function(email) {
        return JSON.parse(fs.readFileSync(getPath(email), {
            encoding: 'utf8'
        }));
    };

    this.saveUser = function(user) {
        var data = JSON.stringify(user, null, 4);
        var file = getPath(user.email);

        fs.writeFileSync(file, data);
    };

    this.createTestUser = function(email) {

    };

    this.createUser = function(email, name, password) {
        var passwordhash = md5(password);

        if (this.userExists(email))
            return false;

        var sto = this.getUserSync('users');
        const length = sto.list.length + 2;
        sto.list.push({
            id: length,
            name: name,
            email: email
        });
        
        var defaultUser = { 
            'avatarID': 'base01', 
            'badge': '80sb01',
            'gRole': 0, 
            'guest': false, 
            'id': length, 
            'joined': Date.now(),
            'language': 'en',
            'level': 1, 
            'blurb': 'Hi, Plug.DJ', 
            'slug': name, 
            'sub': 0, 
            'username': name,
            'password': passwordhash,
            'email': email,
            'silver': false,
            'donator': false,
            'xp': 1, 
            'pp': 1, 
            'pw': true, 
            'place': 0,
            'settings': {
                'chatImages': true, 
                'chatTimestamps': 12, 
                'emoji': true, 
                'friendAvatarsOnly': false, 
                'notifyDJ': true,  
                'notifyFriendJoin': true, 
                'notifyScore': true, 
                'tooltips': true,
                'videoOnly': false, 
            },
            'ignores': [],
            'communities': [],
            'notifications': [],
            'favs': [

            ],
            'playlists': [],
            'avatars': {
                'unlockall': false,
                'list': [{
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base01",
    "level": 1,
    "name": "base01",
    "parent_id": "base01",
    "pp": 402,
    "price": 0,
    "product_id": "base01",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base02",
    "level": 1,
    "name": "base02",
    "parent_id": "base02",
    "pp": 412,
    "price": 0,
    "product_id": "base02",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base03",
    "level": 1,
    "name": "base03",
    "parent_id": "base03",
    "pp": 422,
    "price": 0,
    "product_id": "base03",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base04",
    "level": 1,
    "name": "base04",
    "parent_id": "base04",
    "pp": 432,
    "price": 0,
    "product_id": "base04",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base05",
    "level": 1,
    "name": "base05",
    "parent_id": "base05",
    "pp": 442,
    "price": 0,
    "product_id": "base05",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base06",
    "level": 1,
    "name": "base06",
    "parent_id": "base06",
    "pp": 452,
    "price": 0,
    "product_id": "base06",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base07",
    "level": 1,
    "name": "base07",
    "parent_id": "base07",
    "pp": 462,
    "price": 0,
    "product_id": "base07",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base08",
    "level": 1,
    "name": "base08",
    "parent_id": "base08",
    "pp": 472,
    "price": 0,
    "product_id": "base08",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base09",
    "level": 1,
    "name": "base09",
    "parent_id": "base09",
    "pp": 482,
    "price": 0,
    "product_id": "base09",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base10",
    "level": 1,
    "name": "base10",
    "parent_id": "base10",
    "pp": 492,
    "price": 0,
    "product_id": "base10",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base11",
    "level": 1,
    "name": "base11",
    "parent_id": "base11",
    "pp": 502,
    "price": 0,
    "product_id": "base11",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base12",
    "level": 1,
    "name": "base12",
    "parent_id": "base12",
    "pp": 512,
    "price": 0,
    "product_id": "base12",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base13",
    "level": 1,
    "name": "base13",
    "parent_id": "base13",
    "pp": 522,
    "price": 0,
    "product_id": "base13",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base14",
    "level": 1,
    "name": "base14",
    "parent_id": "base14",
    "pp": 532,
    "price": 0,
    "product_id": "base14",
    "tier_name": "__",
    "type": "avatars"
}, {
    "cash": 0,
    "base": false,
    "category": "base",
    "category_id": 0,
    "currency": 7,
    "currency_name": "plug_points",
    "expires": 99999999999999,
    "id": "base15",
    "level": 1,
    "name": "base15",
    "parent_id": "base15",
    "pp": 542,
    "price": 0,
    "product_id": "base15",
    "tier_name": "__",
    "type": "avatars"
}]
            },
            'badges': {
                'unlockall': false,
                'list': [

                ]
            },
            'history': [],
            'length': 0
        }

        this.saveUser(sto);
        this.saveUser(defaultUser);
    };

    var getPath = function(email) {
        return './users/' + email + '.ini';
    };

};


function getFiles(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return (!(fs.statSync(path.join(srcpath, file)).isDirectory()));
    });
}


function bufferFile(relPath) {
    return fs.readFileSync(relPath);
};