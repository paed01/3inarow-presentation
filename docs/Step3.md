Serverside game
========

Make the game serverside.

- [Game module](#game-module)
   - [Browserify](#browserify)
   - [Modify client side script](#modify-client-side-script)
- [Client-server communication](#client-server-communication)
   - [Server socket.io](#server-socket-io)
   - [Client socket.io](#client-socket-io)

## Game module

To make the game a serverside game we can use the same CommonJS client side JavaScript for the game logic. The only thing we have to do is to make a node.js module out of `game.js`.

As a common practice node.js modules are stored in the sub-directory `/lib`. So we will make a copy of [game.js](/public/js/game.js) in the lib-folder.

Exposing a module is done by setting the `module.exports` statement to the constructor function.

Open [`/lib/game.js`](/lib/game.js) and modify it accordingly:

```javascript
var winningStreaks = [7, 56, 73, 84, 146, 273, 292, 448];
var draw = parseInt('111111111', 2);

// Constructor
var Game = function() {};

// Export the script as a module
exports = module.exports = Game;

Game.prototype.start = function(sign, callback) {
    this.sign = sign || 'X';
    this.checked = {
        X: 0,
        O: 0
    };
    delete this.result;
    if (typeof callback === 'function') {
        callback(null, this.board);
    }
};

// and more...
```

### Browserify

To use the new modulerized game-sqript in frontend we must tell the client that there is a methods called `require`, `export` and `module.exports`. Fortunatelly there is a npm-module that can help us with this. Start by installing the `browserify` module with npm.

`npm install browserify`

Expose the game-module from the http-request-handler

```javascript

var http = require('http');
var fs = require('fs');
var url = require('url');

// Use the newly installed module
var Browserify = require('browserify');
// New instance of module
var browserify = Browserify();

var server = http.createServer(function(req, res) {
    // Root
    if (req.url == '/') {
        var filereader = fs.createReadStream('./public/index.html');
        filereader.pipe(res);
    } else if (req.url == '/js/game.js') { // Override requests for game.js
        browserify.require('./lib/game.js', {
            expose: 'game'
        });
        browserify.bundle().pipe(res);
    } else if (req.url.indexOf('/js/') === 0) {
        var file = __dirname + '/public' + req.url;

        fs.fileExists(file, function(err, exists) {
            if (!exists) {
                res.writeHead(404, req.url + 'not found');
                return res.end();
            }

            var filereader = fs.createReadStream(file);
            response.writeHead(200, {
                'Content-Type': 'application/javascript'
            });
            filereader.pipe(res);
        });
    } else { // Serve all other files found in public
        var reqUrl = url.parse(req.url);
        var file = __dirname + '/public' + reqUrl.pathname;

        fs.fileExists(file, function(err, exists) {
            if (!exists) {
                res.writeHead(404, req.url + 'not found');
                return res.end();
            }

            var filereader = fs.createReadStream(file);
            response.writeHead(200);
            filereader.pipe(res);
        });
    }
});

server.listen(8080);
```

### Modify client side script

For the script to function client side the "module" needs to be required.

```html
<script type="text/javascript">
    $(function() {
        var $wr = $('body');

        // Load browserified node.js module
        var Game = require('game');
        var game = new Game();

        $wr.on('reset', 'a.game', function(e) {
            $(this).attr('class', 'game start');
        });

```

## Client-server communication

To get real-time, full duplex communication between server and client we will use web sockets. The module `socket.io` will be used.

### Server socket.io

Install `socket.io` with:

`npm install socket.io`

In the server javascript require the socket.io module and instantiate a new socket server.

```javascript

var http = require('http');
var fs = require('fs');
var url = require('url');
var IO = require('socket.io');

var server = http.createServer(function(req, res) {
    // Removed for brevity ...
});

// Tell socket.io to listen for sockets on server
var io = IO(server);

// Listen for connections
io.on('connection', function(socket) { // The callback argument is the client socket
    // Send an hello with data to client when started
    socket.emit('hello', {
        and : 'welcome to the game'
    });
});

server.listen(8080);
```

### Client socket.io

The client needs to connect to the server via sockets. Fortunatelly the `socket.io` module exposes the client side script on `/socket.io/socket.io.js`. So we will start with including the javascript on the client.

```html

<script type="text/javascript" src="/js/jquery.min.js"></script>
<!-- Add the socket.io client javascript -->
<script type="text/javascript" src="/socket.io/socket.io.js"></script>
<script type="text/javascript" src="/js/game.js"></script>
<script type="text/javascript">
    $(function() {
        var $wr = $('body');

        // Load browserified node.js module
        var Game = require('game');
        var game = new Game();

        // Create socket instance to server
        var socket = io();

        // Listen for hello-event
        socket.on('hello', function(data){
            console.log('hello', 'and', data.and.name);
        });

        $wr.on('reset', 'a.game', function(e) {
            $(this).attr('class', 'game start');
        });

        // Removed for brevity

```

Start the server and open your browser log. You should receive `hello and welcome to the game` when you refresh the page.

Since the communication is two-ways the client-server communication could also be tested. Add an `io.emit` when clicking the board.

```html

<script type="text/javascript" src="/js/jquery.min.js"></script>
<!-- Add the socket.io client javascript -->
<script type="text/javascript" src="/socket.io/socket.io.js"></script>
<script type="text/javascript" src="/js/game.js"></script>
<script type="text/javascript">
    $(function() {
        var $wr = $('body');

        // Load browserified node.js module
        var Game = require('game');
        var game = new Game();

        // Create socket instance to server
        var socket = io();

        // Listen for hello-event
        socket.on('hello', function(data){
            cosole.log('hello', 'and', data.and.name);
        });

        $wr.on('reset', 'a.game', function(e) {
            $(this).attr('class', 'game start');
        });

        // Removed for brevity

        $wr.on('click', 'a.game', function(e) {
            var $this = $(this);
            var id = $this.closest('.col4').attr('rel');
            game.check(id, function(err, data) {

                $this.trigger('check', data);

                if (data.streak || data.draw) {
                    $wr.trigger('gameover', data);

                    // Restart game after some time
                    setTimeout(function() {
                        game.start(game.sign, function() {
                            $wr.trigger('start', game);
                        });
                    }, 3000);
                }
            });

            // Emit event on socket to send server a message with wich button was clicked
            io.emit('check', {
                id : id
            });
        });

```

Extend the server socket to listen for the check-event:

```javascript

var http = require('http');
var fs = require('fs');
var url = require('url');
var IO = require('socket.io');

var server = http.createServer(function(req, res) {
    // Removed for brevity ...
});

// Tell socket.io to listen for sockets on server
var io = IO(server);

// Listen for connections
io.on('connection', function(socket) { // The callback argument is the client socket
    // Send an hello with data to client when started
    socket.emit('hello', {
        and : 'welcome to the game'
    });

    // Listen for client event
    socket.on('check', function(data){
        console.log('client checked', data.id);
    });
});

server.listen(8080);
```

