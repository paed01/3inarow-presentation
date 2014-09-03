var http = require('http');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Browserify = require('browserify');
var Game = require('./lib/game');
var game = new Game();

var server = http.createServer(function(req, res) {
    if (req.url == '/') {
        return fs.readFile('./public/index.html', function(err, content) {
            res.end(content);
        });
    } else if (req.url == '/local') {
        return fs.readFile('./public/index_local.html', function(err, content) {
            res.end(content);
        });
    } else if (req.url == '/game.js') {
        var browserify = Browserify();
        browserify.require('./lib/game.js', {
            expose: 'Game'
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

var OnlineGame = function() {
    this.started = false;
    this.game = new Game();
};

util.inherits(OnlineGame, EventEmitter);

OnlineGame.prototype.start = function(callback) {
    var _self = this;
    var innerCallback = typeof callback === 'function' ? callback : function() {};

    if (this.started)
        return innerCallback(null);
    this.game.start(this.game.sign, function(err) {
        _self.started = true;
        _self.emit('start', _self.game);
        return innerCallback(null);
    });
};

OnlineGame.prototype.end = function() {
    this.started = false;
    this.emit('end', this.game);

    // Restart game after a while
    this.timer = setTimeout((function() {
        this.start(function() {
            console.log('game restarted');
        });
    }).bind(this), 5000);
};

OnlineGame.prototype.check = function(id, callback) {
    var _self = this;
    if (!this.started)
        return callback(new Error('game not started'));

    this.game.check(id, function(err, result) {
        if (err)
            return callback(err);

        if (result) {
            _self.end();
        }

        callback(null, result);
    });
};

OnlineGame.prototype.maxVote = function(board, callback) {
    var b, v = 0;
    for (var f in board) {
        var field = board[f];

        if (!field.checked) {
            if (field.votes > v) {
                // Reset previous max vote
                if (b) {
                    b.votes = 0;
                }

                b = field;
                v = field.votes;
            } else {
                // Reset votes
                field.votes = 0;
            }
        }
    }
    return callback(null, b);
};

var onlineGame = new OnlineGame();
var io = require('socket.io')(server);

onlineGame.on('start', function(game) {
    io.sockets.emit('start', game);
});

onlineGame.on('end', function(game) {
    io.sockets.emit('end', game);
});

io.on('connection', function(socket) {
    console.log('connection', onlineGame.game);

    socket.emit('game', onlineGame.game);
    socket.on('disconnect', function() {
        console.log('sockect', 'disconnect');
    });

    socket.on('check', function(data) {
        onlineGame.check(data.id, function(err, over) {
            if (err) {
                return console.log(err);
            }
                if (!over) {
                console.log('emit', 'game');
                io.sockets.emit('game', onlineGame.game);
            }
        });

        // game.board[data.id].votes++;
        // io.sockets.emit('vote', game.board[data.id]);
    });
});

server.listen(8080, function() {
    onlineGame.start();
});