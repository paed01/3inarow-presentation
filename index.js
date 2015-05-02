var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 8080;

var Browserify = require('browserify');
var browserify = Browserify();
var jsBundle = browserify.require('./lib/game.js', {
    expose: 'game'
});

var OnlineGame = require('./lib/onlinegame');

var server = http.createServer(function(req, res) {
    var reqPath = url.parse(req.url).pathname;
    if (reqPath === '/') {
        var filereader = fs.createReadStream('./public/index.html');
        return filereader.pipe(res);
    } else if (reqPath === '/local') {
        var filereader = fs.createReadStream('./public/index_local.html');
        return filereader.pipe(res);
    } else if (reqPath === '/js/game.js') { // Override requests for game.js
        return jsBundle.bundle().pipe(res);
    }

    var file = __dirname + '/public' + reqPath;
    var filereader = fs.createReadStream(file);
    filereader.on('error', function() {
        res.writeHead(404);
        res.end();
    });

    if (req.url.indexOf('/js/') === 0) {
        res.writeHead(200, {
            'Content-Type': 'application/javascript'
        });
    }

    return filereader.pipe(res);
});

var onlineGame = new OnlineGame({
    timeout: 3000
});
var io = require('socket.io')(server);

onlineGame.on('start', function(game) {
    io.sockets.emit('start', game);
});

onlineGame.on('end', function(game) {
    io.sockets.emit('end', game);
});

onlineGame.on('vote', function(field) {
    io.sockets.emit('vote', field);
});

onlineGame.on('check', function() {
    io.sockets.emit('game', {
        game: onlineGame.game
    });
});

io.on('connection', function(socket) {
    socket.emit('game', {
        game: onlineGame.game,
        votes: onlineGame.votes
    });
    socket.on('check', function(data) {
        onlineGame.vote(data.id);
    });
});

server.listen(port, function() {
    onlineGame.start();
    console.log('Static file server running at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown');
});
