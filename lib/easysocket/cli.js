var path = require('path'),
    util = require('util'),
    cliff = require('cliff'),
    flatiron = require('flatiron'),
    easysocket = require('../easysocket');

var cli = exports;

var help = [
    'usage: easysocket [action] [options]',
    '',
    'Easy socket implementation for everyone',
    '',
    'actions:',
    '  start               Start SCRIPT as a daemon',
    '  config              Lists all easysocket user configuration',
    '  set <key> <val>     Sets the specified easysocket config <key>',
    '  clear <key>         Clears the specified easysocket config <key>',
    '  list                List of all keys',
    '',
    'options:',
    '  -h, --help       You\'re staring at it',
    '  -p, --port       Choose your port whatever you want',
    '  -s, --ssl        Set true if you\'re using SSL ( You have to set config for pemcert, pemkey and pemca )',
    ''
];
var list = [
    '',
    '* ssl : specify that you are using ssl or not default:false',
    '* pemcert: path of "cert" file, this is mandatory if "ssl" is "true"',
    '* pemkey: path of "key" file, this is mandatory if "ssl" is "true"',
    '* pemca: path of "ca" file, this is mandatory if "ssl" is "true"',
    '',
    '* privateKey:  easysocket can be used with any privateKey for preventing unauthorized access',
    '* auth:  domain based access control, to use set it true and give domain',
    '* domain: give a string or array for white domain list for server'
];


var app = flatiron.app;

var actions = [
    'start',
    'config',
    'set',
    'clear',
    'list'
];

var argvOptions = cli.argvOptions = {
    'port': {alias: 'p'}
};

app.use(flatiron.plugins.cli, {
    argv: argvOptions,
    usage: help
});

var reserved = ['root', 'port'];

function updateConfig(updater) {
    updater();
    easysocket.config.save(function (err) {
        if (err) {
            return easysocket.log.error('Error saving config: ' + err.message);
        }

        cli.config();
        var configFile = path.join(easysocket.config.get('root'), 'config.json');
        easysocket.log.info('easysocket config saved: ' + configFile.blue);
    });
}

var getOptions = cli.getOptions = function () {
    var options = {};
    options.options = process.argv;
    app.config.stores.argv.store = {};
    app.config.use('argv', argvOptions);
    ['port']
        .forEach(function (key) {
            options[key] = app.config.get(key) || easysocket.config.get(key);
        });
    return options;
}

app.cmd('start', cli.startServer = function () {
    easysocket.server.startServer(getOptions());
});

app.cmd('config', cli.config = function () {
    var keys = Object.keys(easysocket.config.store),
        conf = cliff.inspect(easysocket.config.store);
    if (keys.length <= 2) {
        conf = conf.replace(/\{\s/, '{ \n')
            .replace(/\}/, '\n}')
            .replace('\\033[90m', '  \\033[90m')
            .replace(/, /ig, ',\n  ');
    }
    else {
        conf = conf.replace(/\n\s{4}/ig, '\n  ');
    }
    conf.split('\n').forEach(function (line) {
        easysocket.log.data(line);
    });
});


app.cmd(/set ([\w-_]+) (.+)/, cli.set = function (key, value) {
    updateConfig(function () {
        easysocket.log.info('Setting easysocket config: ' + key.grey);
        easysocket.config.set(key, value);
    });
});


app.cmd('clear :key', cli.clear = function (key) {
    if (reserved.indexOf(key) !== -1) {
        easysocket.log.warn('Cannot clear reserved config: ' + key.grey);
        easysocket.log.warn('Use `easysocket set ' + key + '` instead');
        return;
    }

    updateConfig(function () {
        easysocket.log.info('Clearing easysocket config: ' + key.grey);
        easysocket.config.clear(key);
    });
});

app.cmd('help', cli.help = function () {
    util.puts(help.join('\n'));
});


app.cmd('list', cli.list = function () {
    util.puts(list.join('\n'));
});

cli.start = function () {
    if (app.argv.v || app.argv.version) {
        return console.log('v' + easysocket.version);
    }

    if (app.config.get('help')) {
        return util.puts(help.join('\n'));
    }

    app.init(function () {
        if (app.argv._.length && actions.indexOf(app.argv._[0]) === -1) {
            return;
        }
        app.start();
    });
};