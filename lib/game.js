var three = [7, 56, 73, 84, 146, 273, 292, 448];
var draw = parseInt('111111111', 2);

var Game = function() {};
exports = module.exports = Game;

Game.prototype.createBoard = function() {
    var board = {};
    for (var i = 1; i < 257; i *= 2) {
        board[i] = {
            id: i
        };
    }

    return board;
};

Game.prototype.start = function(sign, callback) {
    this.sign = sign || 'X';
    this.board = this.createBoard();
    this.checked = {
        X: 0,
        O: 0
    };
    delete this.result;
    if (typeof callback === 'function') {
        callback(null, this.board);
    }
};

Game.prototype.streak = function(checksum) {
    var streak = [];
    var b = checksum.toString(2);
    for (var i = b.length - 1; i >= 0; i--) {
        if (b[i] === '1') {
            var comp = '1' + new Array(b.length - i).join('0');
            streak.push(parseInt(comp, 2));
        }
    }
    return streak;
};

Game.prototype.check = function(id, callback) {
    if (this.result) {
        return callback(new Error('Game over'));
    }

    var game;
    var b = this.board[id];
    if (!b) {
        callback(null);
    }

    b.checked = this.sign;

    var sum = this.checked[b.checked] = this.checked[b.checked] + b.id;
    switch (this.sign) {
        case 'X':
            this.sign = 'O';
            break;
        case 'O':
            this.sign = 'X';
            break;
        default:
    }

    // Check winning streak
    for (var t in three) {
        var check = three[t];
        if ((sum & check) === check) {
            game = {};
            game.winner = b.checked;
            game.streak = this.streak(check);

            break;
        }
    }

    // Check if draw
    if (!game && this.checked.X + this.checked.O === draw) {
        game = {};
        game.draw = true;
    }

    this.result = game;

    return callback(null, game);
};