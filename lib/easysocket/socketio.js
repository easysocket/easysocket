var easysocket = require('../easysocket'),
    url = require('url');

module.exports = function (server) {
    var io = require("socket.io").listen(server);
    var isAuth = (easysocket.config.get('auth') == 'true');
    if (isAuth) {
        io.configure(function () {
            io.set('authorization', function (handshakeData, callback) {
                var domain = easysocket.config.get('domain')
                if (domain) {
                    var hostname = url.parse(handshakeData.headers.origin).host;
                    var auth = typeof domain == 'string' ? domain == hostname : Array.isArray(domain) ? domain.indexOf(hostname) != -1 : false;
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