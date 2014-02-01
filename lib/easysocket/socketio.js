var easysocket = require('../easysocket');
module.exports = function (server) {
    var io = require("socket.io").listen(server);
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