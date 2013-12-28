var fs = require('fs'),
    path = require('path'),
    events = require('events'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    cliff = require('cliff'),
    nconf = require('nconf'),
    nssocket = require('nssocket'),
    timespan = require('timespan'),
    utile = require('utile'),
    winston = require('winston'),
    mkdirp = utile.mkdirp,
    async = utile.async;

var easysocket = exports;

easysocket.log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ]
});

easysocket.log.cli();

easysocket.out = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ]
});

easysocket.initialized = false;
easysocket.root =path.join(process.env.NODE_ENV || process.env.HOME || process.env.USERPROFILE || '/root', '.easysocket');//path.join( __dirname,'../');
easysocket.config = new nconf.File({ file: path.join(easysocket.root, 'config.json') });
easysocket.cli = require('./easysocket/cli');
easysocket.server = require('./easysocket/server');
easysocket.socketio = require('./easysocket/socketio');
require('pkginfo')(module, 'version');
easysocket.load = function (options) {
    options = options || {};
    options.port = options.port || '7777';
    options.root = options.root || easysocket.root;
    easysocket.config = new nconf.File({ file: path.join(options.root, 'config.json') });
    try {
        easysocket.config.loadSync();
    }
    catch (ex) {
    }
    easysocket.config.set('root', options.root);
    easysocket.config.set('port', options.port);
    easysocket.out.transports.console.timestamp = easysocket.config.get('timestamp') === 'true';
    options.debug = options.debug || easysocket.config.get('debug') || false;
    if (options.debug) easysocket._debug()
    function tryCreate(dir) {
        try {
            fs.mkdirSync(dir, '0755')
        }
        catch (ex) {
        }
    }
    tryCreate(easysocket.config.get('root'));

    try {
        easysocket.config.saveSync();
    }
    catch (ex) {
    }
    easysocket.initialized = true;
};
easysocket.load();

