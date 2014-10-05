var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 8080

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
        var reqUrl = url.parse(req.url);
        return fs.readFile(__dirname + '/public' + reqUrl.pathname, function(err, content) {
            if (err) {
                res.writeHead(404);
                return res.end(err.message);
            }
            res.end(content);
        });
    }

});

var onlineGame = new OnlineGame({ timeout : 5000 });
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

onlineGame.on('check', function(game) {
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
    console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
});