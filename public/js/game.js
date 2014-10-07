var winningStreaks = [7, 56, 73, 84, 146, 273, 292, 448];
var draw = parseInt('111111111', 2);

var Game = function() {};

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

Game.prototype.inStreak = function(id, checksum) {
    var testsum = ~~checksum;
    return ((~~id) | testsum) === testsum;
};

Game.prototype.check = function(id, callback) {
    if (this.result) {
        return callback(new Error('Game over'));
    }

    // If already checked - ignore
    var sum = this.checked[this.sign];
    if ((sum | id) === sum) {
        return callback(null);
    }

    var data = {
        id: id,
        sign: this.sign
    };

    // Set new sum  
    this.checked[this.sign] = sum = sum | id;

    // Check winning streak
    for (var t in winningStreaks) {
        var streak = winningStreaks[t];
        if ((sum & streak) === streak) {
            data.winner = this.sign;
            data.streak = (streak | (data.streak || 0));
        }
    }

    // Check if draw
    if (!data.winner && this.checked.X + this.checked.O === draw) {
        data.draw = true;
    }

    if (data.winner || data.draw) {
        this.result = data;
    }

    // Switch sign
    switch (this.sign) {
        case 'X':
            this.sign = 'O';
            break;
        case 'O':
            this.sign = 'X';
            break;
        default:
    }

    return callback(null, data);
};