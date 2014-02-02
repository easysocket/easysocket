easysocket
==========
easy websocket for everyone

### Using easysocket from the command line
The usage options are simple:

```
  $ easysocket --help
  usage: easysocket [action] [options]

  Monitors the script specified in the current process or as a daemon

  actions:
    start               Start your basic easysocket server
    config              Lists all easysocket configuration
    set <key> <val>     Sets the specified easysocket config <key>
    clear <key>         Clears the specified easysocket config <key>
    keys                List of all keys

  options:
    -p  PORT         Base port for easysocket server
    -h, --help       You're staring at it
```

### $ easysocket start
Starts easysocket with given config.

```
$ easysocket start
    info  - socket.io started
    info: Listening on http://localhost:7777
```
```
$ easysocket start -p 9999
    info  - socket.io started
    info: Listening on http://localhost:9999

```

### $ easysocket config
_Synchronously_ gets the all configuration (config) for the easysocket module.

```
data:    {
data:       root: '/path/of/your/root',
data:       port: '7777',
data:       privateKey: 'm0sts3cur3k3y',
data:       ssl: 'false'
data:    }
```

There are two important options:

* root:     Directory to put all default easysocket config
* port:     easysocket runs on this port `default:7777`

### $ easysocket set key val
_Synchronously_ sets any value for easysocket


```
     $ easysocket list

        * ssl : specify that you are using ssl or not default:false

        * pemcert: path of "cert" file, this is mandatory if "ssl" is "true"
        * pemkey: path of "key" file, this is mandatory if "ssl" is "true"
        * pemca: path of "ca" file, this is mandatory if "ssl" is "true"

        * privateKey:  easysocket can be used with any privateKey for preventing unauthorized access
        * auth:  domain based access control, if set "true", have to give domain
        * domain: give a string or array for white domain list for server
```

Authors
==========
* [Ertugrul Tas](http://github.com/maniacneron)
* [Salim Kayabasi](http://github.com/salimkayabasi)