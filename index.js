var http = require('http');
var fs = require('fs');

var Browserify = require('browserify');

var OnlineGame = require('./lib/onlinegame');

var server = http.createServer(function(req, res) {
    if (req.url == '/') {
        var filereader = fs.createReadStream('./public/index.html');
        filereader.pipe(res);
    } else if (req.url == '/local') {
        var filereader = fs.createReadStream('./public/index_local.html');
        filereader.pipe(res);
    } else if (req.url == '/game.js') {
        var browserify = Browserify();
        browserify.require('./lib/game.js', {
            expose: 'game'
        });
        browserify.bundle().pipe(res);
    } else {
        return fs.readFile(__dirname + '/public' + req.url, function(err, content) {
            if (err) {
                res.writeHead(404);
                return res.end(err.message);
            }
            res.end(content);
        });
    }

});

var onlineGame = new OnlineGame();
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

onlineGame.on('game', function(game) {
    io.sockets.emit('game', game);
});

io.on('connection', function(socket) {
    console.log('connection', onlineGame.game);

    socket.emit('game', onlineGame.game);
    socket.on('disconnect', function() {
        console.log('sockect', 'disconnect');
    });

    socket.on('check', function(data) {
        onlineGame.vote(data.id);
    });
});

server.listen(8080, function() {
    onlineGame.start();
});