var flatiron = require('flatiron'),
    winston = require('winston'),
    easysocket = require('../easysocket');

var app;
var server = exports;

server.startServer = function (options) {
    app = flatiron.app;
    app.log = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)()
        ]
    });
    var isSecure = easysocket.config.get('ssl') == 'true';
    app.use(flatiron.plugins.http, isSecure ?
    {
        https: {
            cert: easysocket.config.get('pemcert'),
            key: easysocket.config.get('pemkey'),
            ca: easysocket.config.get('pemca')
        }
    } : {});
    app.use(flatiron.plugins.static, {dir: __dirname + '/client'});
    app.start(options['port'], function (err) {
        if (err) app.log.error(err);
        easysocket.io = easysocket.socketio(app.server);
        app.router.post('.*', server.post);
        app.router.get('.*', server.get);
        var addr = app.server.address();
        var adrs = (addr.address == '0.0.0.0' || addr.address == '1::') ? 'localhost' : addr.address;
        var msg = 'Listening on http' + (isSecure ? 's' : '') + '://' + adrs + ':' + addr.port;
        app.log.info(msg.red);
    });
}

server.get = function () {
    this.res.end('Wellcome to EasySocket')
}

server.post = function (req, res) {
    req = this.req || req;
    res = this.res || res;
    var data = req.body;
    var privateKey = easysocket.config.get('privateKey');
    var s = easysocket.io.sockets;
    if (privateKey) {
        if (data.privateKey != privateKey) {
            res.status(401).json({code: 401, msg: '401:Unauthorized access.'})
        }
        s = s.of(data.privateKey)
    }
    delete data["privateKey"];
    if (data.sessionid) {
        s = s.socket(data.sessionid)
        delete data["sessionid"];
    }
    if (data.room) {
        s = s.in(data.room)
        delete data["room"];
    }
    s.emit(data.method || 'message', data);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({code: 1, msg: 'OK!'}));
}


