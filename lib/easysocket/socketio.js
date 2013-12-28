var easysocket = require('../easysocket');
var socketio = module.exports = function (server) {
    var io = require("socket.io").listen(server);
    io.sockets.on('connection', function (socket) {
        socket.on('subscribe', function (room) {
            socket.join(room)
        });
        socket.on('unsubscribe', function (room) {
            socket.leave(room)
        });
    });
	var isAuth = (easysocket.config.get('auth') == 'true');
    if (isAuth) {
        io.configure(function () {
            io.set('authorization', function (handshakeData, callback) {
                var domain = easysocket.config.get('domain')
                if (domain) {
                    var auth = (new RegExp(domain)).test(handshakeData.address.address);
                    handshakeData.isAuthorized = auth;
                    callback(null, auth);
                }
                else
                    throw Error('easysocket set domain 127.0.0.1/*')
            });
        });
    }
    return easysocket.io = io;
}