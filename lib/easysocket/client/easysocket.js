(function (esocket) {
    'use strict'
    window.esocket = esocket = window.esocket || (esocket || {});

    function getURLParameter(url, name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20')) || null
    }

    function loadScript(src, callback) {
        var t,
            s = document.createElement('script');
        s.async = 1;
        s.type = 'text/javascript';
        s.src = src;
        s.onload = s.onreadystatechange = function () {
            if (!this.readyState || this.readyState == 'complete') {
                callback();
            }
        };
        t = document.getElementsByTagName('head')[0];
        t.appendChild(s, t);
    }

    function connect() {
        esocket.options = options;
        esocket.connect = function () {
            esocket.socket = window.io.connect(esocket.options.url, (typeof esocket.options.apiKey == 'string') ? { query: 'apiKey=' + esocket.options.apiKey } : {})
        }
        esocket.connect();
        esocket.on = function (methodName, callback) {
            if (esocket.socket)
                esocket.socket.on(methodName, callback);
            else
                console.log('socket.io need init')
        }
        esocket.listen = function (roomName) {
            if (esocket.socket)
                esocket.socket.emit('subscribe', roomName)
            else
                console.log('socket.io need init')
        }
        esocket.api = function (value) {
            if (value && (typeof value == 'string')) {
                esocket.options.apiKey = value;
                esocket.connect();
            }
            return esocket.options.apiKey;
        }
        if (typeof esocket.options.callback == 'string' && window[esocket.options.callback])
            window[esocket.options.callback]()
        else
            console.log('easysocket need a param called "callback"')
    }

    var options = {}
        , esocketjs = document.getElementsByClassName('esocketjs')[0]
        , parser = document.createElement('a');

    parser.href = esocketjs.src;
    options.apiKey = getURLParameter(esocketjs.src, 'apiKey')
    options.callback = getURLParameter(esocketjs.src, 'callback')
    options.url = parser.protocol + '//' + parser.host;
    loadScript(options.url + '/socket.io/socket.io.js', connect)
}(window.esocket))


