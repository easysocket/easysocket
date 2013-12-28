var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    colors = require('colors'),
    cliff = require('cliff'),
    flatiron = require('flatiron'),
    easysocket = require('../easysocket');

var cli = exports;


var help = [
    'usage: easysocket [action] [options] SCRIPT [script-options]',
    '',
    'Easy socket implementation for everyone',
    '',
    'actions:',
    '  start               Start SCRIPT as a daemon',
    '  stop                Stop the daemon SCRIPT',
    '  stopall             Stop all running easysocket scripts',
    '  restart             Restart the daemon SCRIPT',
    '  restartall          Restart all running easysocket scripts',
    '  list                List all running easysocket scripts',
    '  config              Lists all easysocket user configuration',
    '  set <key> <val>     Sets the specified easysocket config <key>',
    '  clear <key>         Clears the specified easysocket config <key>',
    '  logs                Lists log files for all easysocket processes',
    '  logs <script|index> Tails the logs for <script|index>',
    '  columns add <col>   Adds the specified column to the output in `easysocket list`',
    '  columns rm <col>    Removed the specified column from the output in `easysocket list`',
    '  columns set <cols>  Set all columns for the output in `easysocket list`',
    '  cleanlogs           [CAREFUL] Deletes all historical easysocket log files',
    '',
    'options:',
    '  -m  MAX          Only run the specified script MAX times',
    '  -l  LOGFILE      Logs the easysocket output to LOGFILE',
    '  -o  OUTFILE      Logs stdout from child script to OUTFILE',
    '  -e  ERRFILE      Logs stderr from child script to ERRFILE',
    '  -p  PATH         Base path for all easysocket related files (pid files, etc.)',
    '  -c  COMMAND      COMMAND to execute (defaults to node)',
    '  -a, --append     Append logs',
    '  -f, --fifo       Stream logs to stdout',
    '  -n, --number     Number of log lines to print',
    '  --pidFile        The pid file',
    '  --sourceDir      The source directory for which SCRIPT is relative to',
    '  --minUptime      Minimum uptime (millis) for a script to not be considered "spinning"',
    '  --spinSleepTime  Time to wait (millis) between launches of a spinning script.',
    '  --colors         --no-colors will disable output coloring',
    '  --plain          alias of --no-colors',
    '  -d, --debug      Forces easysocket to log debug output',
    '  -v, --verbose    Turns on the verbose messages from easysocket',
    '  -s, --silent     Run the child script silencing stdout and stderr',
    '  -w, --watch      Watch for file changes',
    '  --watchDirectory Top-level directory to watch from',
    '  --watchIgnore    To ignore pattern when watch is enabled (multiple option is allowed)',
    '  -h, --help       You\'re staring at it',
    '',
    '[Long Running Process]',
    '  The easysocket process will continue to run outputting log messages to the console.',
    '  ex. easysocket -o out.log -e err.log my-script.js',
    '',
    '[Daemon]',
    '  The easysocket process will run as a daemon which will make the target process start',
    '  in the background. This is extremely useful for remote starting simple node.js scripts',
    '  without using nohup. It is recommended to run start with -o -l, & -e.',
    '  ex. easysocket start -l easysocket.log -o out.log -e err.log my-daemon.js',
    '      easysocket stop my-daemon.js',
    ''
];

var app = flatiron.app;

var actions = [
    'start',
    'config',
    'set',
    'clear',
    'logs',
    'cleanlogs'
];

var argvOptions = cli.argvOptions = {
    'command': {alias: 'c'},
    'errFile': {alias: 'e'},
    'logFile': {alias: 'l'},
    'append': {alias: 'a', boolean: true},
    'fifo': {alias: 'f', boolean: false},
    'number': {alias: 'n'},
    'max': {alias: 'm'},
    'outFile': {alias: 'o'},
    'port': {alias: 'p'},
    'help': {alias: 'h'},
    'silent': {alias: 's', boolean: true},
    'verbose': {alias: 'v', boolean: true},
    'watch': {alias: 'w', boolean: true},
    'debug': {alias: 'd', boolean: true},
    'plain': {boolean: true}
};

app.use(flatiron.plugins.cli, {
    argv: argvOptions,
    usage: help
});

var reserved = ['root', 'pidPath'];

//
// ### @private function updateConfig (updater)
// #### @updater {function} Function which updates the easysocket config
// Helper which runs the specified `updater` and then saves the easysocket
// config to `easysocket.config.get('root')`.
//
function updateConfig(updater) {
    updater();
    easysocket.config.save(function (err) {
        if (err) {
            return easysocket.log.error('Error saving config: ' + err.message);
        }

        cli.config();
        var configFile = path.join(easysocket.config.get('root'), 'config.json');
        easysocket.log.info('easysocket config saved: ' + configFile.yellow);
    });
}

var getOptions = cli.getOptions = function () {
    var options = {};
    options.options = process.argv;
    app.config.stores.argv.store = {};
    app.config.use('argv', argvOptions);
    ['logFile', 'errFile', 'append', 'silent', 'outFile', 'port']
        .forEach(function (key) {
            options[key] = app.config.get(key) || easysocket.config.get(key);
        });
    return options;
}

app.cmd('start', cli.startServer = function () {
    //easysocket.server = require('./server');
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