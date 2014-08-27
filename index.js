var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    if (req.url == '/') {
        return fs.readFile('./public/index.html', function(err, content) {
            res.end(content);
        });
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
var io = require('socket.io')(server);

function createBoard() {
    var board = {};
    for (var c = 1; c < 4; c++) {
        for (var r = 1; r < 4; r++) {
            board[r * 10 + c] = {
                row: r,
                col: c,
                votes: 0
            };
        }
    }
    return board;
}
var board = createBoard();

function getMaxVote(board, callback) {
    var b, v = 0;
    for (var cell in board) {
        if (board[cell].votes > v) {
            b = board[cell];
            v = b.votes;
        } else {
            board[cell].votes = 0;
        }
    }
    if (b) {
        b.checked = 'X';
    }

    return callback(null);
}

io.on('connection', function(socket) {
    socket.emit('game', board);

    socket.on('vote', function(data) {
        var key = ~~data.row * 10 + ~~data.col;
        board[key].votes++;
        io.sockets.emit('vote', board[key]);
    });
});

server.listen(8080, function() {
    var set = 10000;
    var timer = setInterval(function() {
        getMaxVote(board, function(err, b) {
            io.sockets.emit('game', board);
        });
    }, set)
});