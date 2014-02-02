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
    list                List of all keys
    set <key> <val>     Sets the specified easysocket config <key>
    clear <key>         Clears the specified easysocket config <key>

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

### $ easysocket list
List of all config keys

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


### $ easysocket set _key_ _val_
Update or insert new key for easysocket config

```
$ easysocket set port 9999
    info:    Setting easysocket config: port
    data:    {
    data:       root: '/path/of/your/root',
    data:       port: '9999'
    data:    }
    info:    easysocket config saved: /path/of/your/root/config.json
```
```
$ easysocket set lovingEasySocket YES
    info:    Setting easysocket config: port
    data:    {
    data:       root: '/path/of/your/root',
    data:       port: '9999',
    data:       lovingEasySocket: 'YES'
    data:    }
    info:    easysocket config saved: /path/of/your/root/config.json
```

### $ easysocket clear _key_
Basically unset of given key

```
$ easysocket clear port
    warn:    Cannot clear reserved config: port
    warn:    Use `easysocket set port` instead
```
* some keys are mandatory `root,port`

```
$ easysocket clear lovingEasySocket
    info:    Clearing easysocket config: lovingEasySocket
    data:    {
    data:       root: '/path/of/your/root',
    data:       port: '9999'
    data:    }
    info:    easysocket config saved: /path/of/your/root/config.json
```

Authors
==========
* [Ertugrul Tas](http://github.com/maniacneron)
* [Salim Kayabasi](http://github.com/salimkayabasi)