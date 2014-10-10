Serverside game
========

Make the game serverside.

- [Game module](#game-module)
   - [Browserify](#browserify)
   - [Modify client side script](#modify-client-side-script)
- [Determining the winner](#determining-the-winner)
- [Draw](#draw)

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

For the script to function client side the "module" needs to be addressed.

```html
<script type="text/javascript">
    $(function() {
        var $wr = $('body');

        // Load browserified module
        var Game = require('game');
        var game = new Game();

        $wr.on('reset', 'a.game', function(e) {
            $(this).attr('class', 'game start');
        });

```