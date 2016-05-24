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
            processPost(con, res);
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

        function process(con, res) {
            //Add the extra functions
            setupConnection(con, res);

            var url = con.url;

            //Check redirects
            if (whitelistRedirect(con, res))
                return;

            if (redirDash(con, res))
                return;

            if (url.contains('..'))
                return;

            //router
            getAssetTypeFromURL(url, function (type) {
                switch (type) {
                    case 'IDK':
                        res.statusCode = 404;
                        serveUTFAsset(res, './pages/404.html');
                        break;
                    case 'JAVASCRIPT':
                        tryServeUTFAsset(res, './scripts' + url)
                        break;
                    case 'STYLE':
                        tryServeUTFAsset(res, './css' + url)
                        break;
                    case 'PROFILE':
                        runModule('./profile.js', undefined, con, res);
                        break;
                    case 'ROOM':
                        serveUTFAsset(res, './pages/room.html');
                        break;
                    case 'ROOTASSET':
                        tryServeUTFAsset(res, './assets' + url.substring(url.lastIndexOf('/')));
                        break;
                    case 'API':
                        processMod(con, res, con.json, getMain);
                        break;
                    case 'ASSET':
                        tryServeUTFAsset(res, '.' + url.replace('_/static', 'assets'));
                        break;
                    case 'PAGE':
                        serveUTFAsset(res, util.format('./pages%s.html', url));
                        break;
                    default:
                        logger.debug(util.format('%s issued an unknown type %s', con.url, type));
                        break;
                }
            });

        };

        function whitelistRedirect(con, res) {
            var config = getMain().config;

            if (config.mode && config.whitelist) {
                var whiteListed = con.getIps().filter((ip) => {
                    return config.whitelist.contains(con.getBestIP());
                }).length;

                if (!whiteListed) {
                    serveUTFAsset(res, util.format('./pages/%s.html', config.mode));
                    return true;
                }
            }
            return false;
        };

        function redirDash(con, res) {
            var url = con.url;
            var isHomepage = url === '/';
            var isDashboard = url === '/dashboard';
            var loggedIn = isLoggedIn(con);

            if (isHomepage) {
                if (loggedIn) {
                    res.statusCode = 302;
                    res.setHeader('Location', '/dashboard');
                    res.end('');
                } else {
                    serveUTFAsset(res, './pages/home.html');
                }
                return true;
            }

            if (isDashboard) {
                if (!loggedIn) {
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

        //Get payload
        function processPost(con, res) {
            var body = undefined;
            con.on('data', function (data) {
                body = body || '' + data;
            });

            con.on('end', function () {
                if (!(body))
                    body = '{}';

                //Attempt to parse
                try {
                    con.json = JSON.parse(body);
                } catch (e) {
                    res.end(JSON.stringify({
                        code: 400,
                        meta: {},
                        data: ['Bad payload (couldn\'t parse)'],
                        time: 0,
                        status: 'bad'
                    }));
                    return;
                }

                //Process it like a regular request
                process(con, res);
            });
        };

        //attempt to find the .js module for an api call 
        function processMod(con, res, data, getMain) {
            var file = util.format('./api/%s.js', con.url.replace('/_/', ''));

            //HACK FEST.... TODO: cleanup FUCKING CANCER EW NO PLS NO FUCKING NO
            if (!(existsSync(file))) {
                file = file.substring(0, file.lastIndexOf('/')) + '/index.js';
                while (!(existsSync(file))) {
                    file = file.replaceLast('/', '');
                    file = file.substring(0, file.lastIndexOf('/')) + '/index.js';
                    if (file.split('/').length === 2) {
                        res.ends('no module', 404, 'no module');
                        return;
                    }
                }
            }
            ///

            runModule(file, data, con, res);
        };

        function runModule(file, data, con, res) {
            var Module = require(file);
            var module = new Module(getMain, data, con, res);
            delete module;
            delete Module;
        };


        function parseParms(con, res) {
            con.headers.cookie.split(';').forEach((item) => {
                const e = item.indexOf('=');
                con.cookies[item.substring(0, e).replace(' ', '')] = decodeURIComponent(item.substring(e + 1));
            });

            if (con.url.contains('?')) {
                con.args = {};

                var index = con.url.indexOf('?');
                var args = con.url.substring(index + 1);
                con.url = con.url.substring(0, index);

                args.split('&').forEach((item) => {
                    var ei = item.indexOf('=');
                    con.args[item.substring(0, ei)] = decodeURIComponent(item.substring(ei + 1));
                });
            }
        }

        //session stuff
        function addSessionAndTokenIfMissing(con, res) {
            con.token = con.cookies.token;

            if (!(hasValidToken(con))) {
                con.token = '';
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (var i = 0; i < 1500; i++)
                    con.token += possible.charAt(Math.getRandom(0, possible.length));

                getMain().sessions.push(new Session(getMain, con.token)); //TODO CHECK IF IN USE 

                res.setHeader('Set-Cookie', util.format('token=%s; path=/; expires=%s', con.token, new Date(Date.leg_now() + 863344400000).toGMTString()));
            }

            con.session = getMain().sessions.filter((obj) => {
                return obj.token === con.token;
            })[0];
        }

        //ease of access
        function setupConnection(con, res) {
            con.url = con.originalUrl.toString();
            con.start = Date.leg_now();
            con.headers.cookie = con.headers.cookie || '';
            con.cookies = {};

            con.getBestIP = () => {
                var ip = undefined;
                var ipHeader = con.headers['X-Forwarded-For'] ||
                    con.headers['X-Real-IP'] ||
                    con.headers['X-Real-Ip'];
                if (!(ipHeader)) {
                    ip = con.connection.remoteAddress.after(':');
                } else if (ipHeader.contains(', ')) {
                    ip = ipHeader.split(', ')[0];
                } else if (ipHeader) {
                    ip = ipHeader;
                }
                return ip;
            };

            parseParms(con, res);
            addSessionAndTokenIfMissing(con, res);

            res.scookie = '';

            res.setCookie = (key, value, length) => {
                res.scookie += util.format('%s=%s; path=/; expires=%s', key, value, length || new Date(Date.now() + 863344400000).toGMTString())
            };

            res.send = (data, code, status) => {
                if (res.scookie !== '')
                    res.setHeader('Set-Cookie', res.scookie);

                res.setHeader('Server', 'PlugDJ!');

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

            res.ends = res.send;
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
        
        //Deprecated
        function existsSync(path) {
            if (!(path.startsWith('.')))
                path = ''.' + path;
            try {
                fs.accessSync(path, fs.F_OK);
                return true;
            } catch (e) {
                return false;
            }
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
            if (!(path.startsWith('.')))
                path = '.' + path;

            exists(path), function (found) {
                if (found) {
                    res.end(replacePlaceHolders(fs.readFileSync(path, 'utf8')));
                } else {
                    res.statusCode = 404;
                    res.end(util.format('%s was not found', path));
                }
            });
        };

        //serve 
        function serveAsset(res, path) {
            processCType(res, path);
            if (!(path.startsWith('.')))
                path = '.' + path;

            exists(path, function (found) {
                if (found) {
                    res.end(fs.readFileSync(path), 'binary');
                } else {
                    res.end(util.format('%s was not found', path));
                }
            });
        };

        function replacePlaceHolders(payload) {
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

            exists(pathb, function (found) {
                if (found) {
                    tryServeUTFAsset(res, pathb);
                } else {
                    tryServeUTFAsset(res, patha);
                }
            });
        };

        function getAssetTypeFromURL(url, cb) {
            if (url.endsWith('/'))
                url = url.substring(0, url.length - 1);

            if (url.indexOf('js') > -1)
                cb('JAVASCRIPT');
            if (url.contains('css'))
                cb('STYLE');
            if (url.contains('_/') && !url.contains('_/static'))
                cb('API');
            if (url.contains('@/'))
                cb('PROFILE');
            if (getMain().rooms.filter((obj) => {
                    return url.contains(obj.slug)
                }).length)
                cb('ROOM');


            exists('.' + url.replace('_/static', 'assets'), function (found) {
                if (found) {
                    cb('ASSET');
                    return;
                }

                exists('./assets' + url.substring(url.lastIndexOf('/')), function (found) {
                    if (found) {
                        cb('ROOTASSET');
                        return;
                    }

                    exists('./pages' + url + '.html', function (found) {
                        if (found) {
                            cb('PAGE');
                            return;
                        }

                        cb('IDK');
                    });
                });
            });
        };

        //util
        function exists(path, callback) {
            if (!(path.startsWith('.')))
                path = '.' + path;

            fs.access(path, fs.F_OK, function (error) {
                callback(!error);
            });
        };

        //Add the content type header
        function processCType(response, url) {
            switch (url.contains('.') ? url.substring(url.lastIndexOf('.') + 1) : '') {
                case 'js':
                    response.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
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
