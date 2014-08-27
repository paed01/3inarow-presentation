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
    // for (var c = 1; c < 4; c++) {
    //     for (var r = 1; r < 4; r++) {
    //         board[r * 10 + c] = {
    //             row: r,
    //             col: c,
    //             votes: 0
    //         };
    //     }
    // }

    for (var i = 1; i < 257; i *= 2) {
        board[i] = {
            id: i,
            votes: 0
        };
        console.log('#createBoard', i)
    }


    return board;
}
var board = createBoard();

var sign = 'X';

var three = [7, 56, 73, 84, 146, 273, 292, 448];

function streak(checksum) {
    var streak = [];
    var b = checksum.toString(2);
    console.log('#streak', b);

    // var str = new Array(b.length + 1).join('0').split();
    for (var i = b.length - 1; i >= 0; i--) {
        if (b[i] === '1') {
            var comp = '1' + new Array(b.length - i).join('0');
            
            console.log('#streak', b, i, comp);

            console.log(comp);
            streak.push(parseInt(comp, 2));
        }
    }

    return streak;
}

function getMaxVote(board, callback) {
    var b, checked = {
            X: 0,
            O: 0
        },
        v = 0;
    for (var cell in board) {
        var ch = board[cell];

        if (!ch.checked) {
            if (ch.votes > v) {
                if (b) {
                    b.votes = 0;
                }

                b = ch;
                v = b.votes;
            } else {
                ch.votes = 0;
            }
        } else {
            checked[ch.checked] += ch.id;
        }
    }

    var game;
    if (b) {
        b.checked = sign;
        var sum = checked[b.checked] + b.id;
        switch (sign) {
            case 'X':
                sign = 'O';
                break;
            case 'O':
                sign = 'X';
                break;
            default:
        }

        for (var t in three) {
            var check = three[t];
            if ((sum & check) === check) {
                console.log('game', sum, check);

                game = {};
                game.over = true;
                game.winner = b.checked;
                game.streak = streak(check);

                break;
            }
        }
    }

    return callback(null, game);
}

io.on('connection', function(socket) {
    socket.emit('game', {
        board: board
    });

    socket.on('vote', function(data) {
        console.log(data);

        board[data.id].votes++;
        io.sockets.emit('vote', board[data.id]);
    });
});

server.listen(8080, function() {
    var set = 3000;
    var timer = setInterval(function() {
        getMaxVote(board, function(err, game) {
            io.sockets.emit('game', {
                board: board,
                game: game
            });
            if (game) {
                console.log(board, game);
                board = createBoard();
            }
        });
    }, set);
});