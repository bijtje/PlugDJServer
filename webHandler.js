var express = require('express'),
    logger = require('./logger'),
    fs = require('fs'),
    Session = require('./session.js'),
    util = require('util');

module.exports = function (getMain) {
    var app = express();
    var router = express.Router();

    app.get('/_/static/js/*', (con, res) => {
        processFolder('scripts', con, res);
    });

    app.get('/_/static/lib/*', (con, res) => {
        processFolder('scripts', con, res);
    });

    app.get('/_/static/css/*', (con, res) => {
        processFolder('css', con, res);
    });

    app.get('/_/static/*', (con, res) => {
        processFolder('assets', con, res);
    });

    app.get('/out/*', (con, res) => {
        processFolder('avatars', con, res);
    });

    app.post('/_/*', (con, res) => {
        processPost(con, res, getMain);
    });

    app.put('/_/*', (con, res) => {
        processPost(con, res);
    });

    app.delete('/_/*', (con, res) => {
        process(con, res);
    });

    app.use('*', (con, res) => {
        process(con, res);
    })

    app.listen(getMain().config.port, function () {
        logger.log('Server started!');
    })

    function processPost(con, res) {
        var body = '';
        con.on('data', function (data) {
            body += data;
        });
        con.on('end', function () {
            if (body === '')
                body = '{}';
            try {
                con.json = JSON.parse(body);
            } catch (e) {
                res.end(JSON.stringify({
                    code: 400,
                    meta: {},
                    data: ["Bad payload (couldn't parse)"],
                    time: 0,
                    status: 'bad'
                }));
            }
            process(con, res);
        });
    }


    function process(con, res) {
        setupCon(con, res);
        var url = con.url;
        var type = getAssetTypeFromURL(con.url);
        var config = getMain().config;

        if ((config.mode) && (config.whitelist)) {
            var isWhiteListed = con.getIps().filter((ip) => {
                return config.whitelist.contains(ip.substring(ip.lastIndexOf(':') + 1));
            }).length || config.whitelist.contains(con.ip.substring(con.ip.lastIndexOf(':') + 1));
            
            if (!(isWhiteListed)) {
                serveUTFAsset(res,
                              util.format('./pages/%s.html', config.mode));
                return;
            }
        }
        
        if (redirDash(con, res))
            return;
        
        if (config.debug)
            logger.debug('%s> %s', url, type);

        switch (type) {
            case 'IDK':
                res.statusCode = 404;
                res.end('Couldn\'t process...');
                break;
            case 'JAVASCRIPT':
                tryServeUTFAsset(res, './scripts' + url)
                break;
            case 'STYLE':
                tryServeUTFAsset(res, './css' + url)
                break;
            case 'PROFILE':
                doModule('./profile.js', undefined, con, res);
                break;
            case 'ROOM':
                serveUTFAsset(res, './pages/room.html');
                break;
            case "ROOTASSET":
                tryServeUTFAsset(res, './assets' + url.substring(url.lastIndexOf('/')));
                break;
            case 'API':
                processMod(con, res, con.json, getMain);
                break;
            case "ASSET":
                tryServeUTFAsset(res, '.' + url.replace('_/static', 'assets'));
                break;
            case "PAGE":
                serveUTFAsset(res, util.format('./pages%s.html', url));
                break;
            default:
                logger.debug(util.format('%s issued an unknown type %s', con.url, type));
                break;
        }
    };

    function redirDash(con, res) {
        var url = con.url;
        if (url === '/') {
            if (isLoggedIn(con)) {
                res.statusCode = 302;
                res.setHeader('Location', '/dashboard');
                res.end('');
            } else {
                serveUTFAsset(res, './pages/home.html');
            }
            return true;
        }

        if (url === '/dashboard') {
            if (!(isLoggedIn(con))) {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                res.end('');
            } else {
                serveUTFAsset(res, './pages/room.html');
            }
            return true;
        }
        
        return false;
    }

    //attempt to find the .js module for an api call 
    function processMod(con, res, data, getMain) {
        if (con.url.contains('..'))
            return;

        var file = util.format('./api/%s.js', con.url.replace('/_/', ''));

        //HACK FEST.... TODO: cleanup FUCKING CANCER EW NO PLS NO FUCKING NO
        if (!(exists(file))) {
            file = file.substring(0, file.lastIndexOf("/")) + '/index.js';
            while (!(exists(file))) { 
                file = file.replaceLast('/', '');
                file = file.substring(0, file.lastIndexOf("/")) + '/index.js';
                if (file.split('/').length === 2) {
                    res.ends('no module', 404, 'no module');
                    return;
                }
            }
        }
        ///

        doModule(file, data, con, res);
    };

    //load and run that .js module
    function doModule(file, data, con, res) {
        if (getMain().config.debug)
            logger.log('Doing API call |%s|', file);
        var Module = require(file);
        var module = new Module(getMain, data, con, res);
        delete module;
        delete Module;
        delete require.cache[require.resolve(file)]
    }

    //parse the args and cookies
    function parseParms(con, res) {
        con.headers.cookie.split(';').forEach((item) => {
            const e = item.indexOf('=');
            con.cookies[item.substring(0, e).replace(' ', '')] = decodeURIComponent(item.substring(e + 1));
        });

        if (con.url.contains('?')) {
            con.args = {};
            const index = con.url.indexOf('?');
            const args = con.url.substring(index + 1);
            con.url = con.url.substring(0, index);

            args.split('&').forEach((item) => {
                const ei = item.indexOf('=');
                con.args[item.substring(0, ei)] = decodeURIComponent(item.substring(ei + 1));
            });
        }

    }

    //session stuff
    function addSessionAndTokenIfMissing(con, res) {
        con.token = con.cookies.token;

        if (!(hasValidToken(con))) {
            con.token = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 1500; i++)
                con.token += possible.charAt(Math.getRandom(0, possible.length));

            getMain().sessions.push(new Session(getMain, con.token)); //TODO CHECK IF IN USE 

            res.setHeader("Set-Cookie", util.format("token=%s; path=/; expires=%s", con.token, new Date(Date.leg_now() + 863344400000).toGMTString()));
        }

        con.session = getMain().sessions.filter((obj) => {
            return obj.token === con.token;
        })[0];
    }

    //ease of access
    function setupCon(con, res) {
        con.url = con.originalUrl.toString();
        con.start = Date.leg_now();
        var ipHeader = con.headers['x-forwarded-for'] 
            || con.connection.remoteAddress;
        con.headers.cookie = con.headers.cookie 
            || '';
        con.cookies = {};
        
        con.getIps = () => {
            if (ipHeader.contains(',')) {
                return ipHeader.split(', ');
            } else {
                return [ipHeader];
            }
        }


        parseParms(con, res);
        addSessionAndTokenIfMissing(con, res);

        res.ends = (data, code, status) => {
            code = code || 200;
            status = status || 'ok';
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                data: data,
                code: code,
                status: status,
                meta: {},
                time: Date.leg_now() - con.start
            }, 0, 4));
        };
    };

    //util
    function isLoggedIn(con) {
        var token = con.cookies.token;
        if (!(token))
            return false;
        return getMain().sessions.filter((obj) => {
            return obj.token === token && obj.loggedIn
        }).length > 0;
    };

    //util
    function hasValidToken(con) {
        var token = con.cookies.token;
        if (!(token))
            return false;
        return getMain().sessions.filter((obj) => {
            return obj.token === token
        }).length > 0;
    };

    //serve 
    function tryServeUTFAsset(res, path) {
        var type = getAssetTypeFromURL(path);
        var utf = type === 'JAVASCRIPT' || type === 'STYLE' || type === 'PAGE' || path.contains('html');

        if (utf)
            serveUTFAsset(res, path);
        else
            serveAsset(res, path);
    };

    //serve 
    function serveUTFAsset(res, path) {
        processCType(res, path);
        if (!(path.startsWith(".")))
            path = "." + path;
        if (exists(path)) {
            res.end(replacePH(fs.readFileSync(path, 'utf8')));
        } else {
            res.statusCode = 404;
            res.end(util.format('%s was not found', path));
        }
    };
    
    //serve 
    function serveAsset(res, path) {
        processCType(res, path);
        if (!(path.startsWith(".")))
            path = "." + path;
        if (exists(path)) {
            res.end(fs.readFileSync(path), 'binary');
        } else {
            res.end(util.format('%s was not found', path));
        }
    };

    function replacePH(payload) {
        var conf = getMain().config;
        return payload.replaceAll('[DATE/TIME]', Date.now())
            .replaceAll('[MOTD]', conf.motd)
            .replaceAll('[VERSION]', conf.version)
            .replaceAll('[CARD:FBTWREPLACEMENT]', conf.tw)
            .replaceAll('[THEME:FRAMEW]', conf.theme.framew)
            .replaceAll('[THEME:FRAMEH]', conf.theme.frameh)
            .replaceAll('[THEME:PLAYER]', conf.theme.player)
            .replaceAll('[THEME:BACKGROUND]', conf.theme.background)
            .replaceAll('[API]', conf.API)
            .replaceAll('[HOST]', conf.host)
            .replaceAll('[CDN]', conf.cdn)
            .replaceAll('[SERVER]', conf.server)
            .replaceAll('[SOCKETPORT]', conf.sport);
    };

    function processFolder(path, con, res) {
        patha = util.format('./%s/%s', path, con.originalUrl.replace('/_/static/', ''));
        pathb = './' + path + con.url.substring(con.originalUrl.lastIndexOf('/'));

        if (exists(pathb)) {
            tryServeUTFAsset(res, pathb);
            return;
        }

        tryServeUTFAsset(res, patha);
    };

    function getAssetTypeFromURL(url) {
        if (url.endsWith('/'))
            url = url.substring(0, url.length - 1);
        if (url.indexOf('js') > -1)
            return 'JAVASCRIPT';
        if (url.contains('css'))
            return 'STYLE';
        if (exists('.' + url.replace('_/static', 'assets')))
            return 'ASSET';
        if (exists('./assets' + url.substring(url.lastIndexOf('/'))))
            return 'ROOTASSET';
        if (exists('./pages' + url + '.html'))
            return 'PAGE';
        if (url.contains('@/'))
            return 'PROFILE';
        if (url.contains('_/'))
            return 'API';
        if (getMain().rooms.filter((obj) => {
                return url.contains(obj.slug)
            }).length > 0)
            return 'ROOM';
        return 'IDK';
    };

    //util
    function exists(path) {
        if (!(path.startsWith('.')))
            path = "." + path;
        try {
            fs.accessSync(path, fs.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    };

    //Add the content type header
    function processCType(response, url) {
        switch (url.contains('.') ? url.substring(url.lastIndexOf('.') + 1) : '') {
        case 'js':
            response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
            break;
        case 'css':
            response.setHeader('Content-Type', 'text/css; charset=UTF-8');
            break;
        case 'html':
            response.setHeader('Content-Type', 'text/html; charset=UTF-8');
            break;
        case 'jpeg':
            response.setHeader('Content-Type', 'image/jpeg');
            break;
        case 'jpg':
            response.setHeader('Content-Type', 'image/jpg');
            break;
        case 'png':
            response.setHeader('Content-Type', 'image/png');
            break;
        default:

            break;
        }
    };
}