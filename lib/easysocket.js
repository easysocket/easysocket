var fs = require('fs'),
    path = require('path'),
    nconf = require('nconf'),
    winston = require('winston')

var easysocket = exports;

easysocket.log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ]
});

easysocket.log.cli();
easysocket.cli = require('./easysocket/cli');
easysocket.server = require('./easysocket/server');
easysocket.socketio = require('./easysocket/socketio');
require('pkginfo')(module, 'version');
easysocket.root = path.join(process.env.NODE_ENV || process.env.HOME || process.env.USERPROFILE || '/root', '.easysocket');
try {
    fs.mkdirSync(easysocket.config.get('root'), '0755')
} catch (e) {
}
easysocket.config = new nconf.File({file: path.join(easysocket.root, 'config.json')});
easysocket.config.loadSync();
easysocket.config.set('port', easysocket.config.get('port') || '7777');
easysocket.config.saveSync();