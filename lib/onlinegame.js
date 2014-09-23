var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Game = require('./game');

var OnlineGame = function() {
    this.started = false;
    this.game = new Game();
};

exports = module.exports = OnlineGame;

util.inherits(OnlineGame, EventEmitter);

OnlineGame.prototype.start = function(callback) {
    var _self = this;
    var innerCallback = typeof callback === 'function' ? callback : function() {};

    if (this.started)
        return innerCallback(null);

    this.game.start(this.game.sign, function(err) {
        _self.started = true;
        _self.emit('start', _self.game);
        _self.startVoting();
        return innerCallback(null);
    });
};


OnlineGame.prototype.end = function() {
    this.endVoting();
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
    var innerCallback = typeof callback === 'function' ? callback : function() {};

    if (!this.started)
        return innerCallback(new Error('game not started'));

    this.game.check(id, function(err, result) {
        if (err)
            return innerCallback(err);

        if (result) {
            _self.end();
        }

        innerCallback(null, result);
    });
};

OnlineGame.prototype.vote = function(id) {
    var _self = this;
    var field = _self.game.board[id];
    if (field.votes === undefined)
        field.votes = 0;

    field.votes += 1;
    _self.emit('vote', field);
};

OnlineGame.prototype.startVoting = function() {
    var _self = this;
    this.voteInterval = setInterval(function() {
        _self.maxVote(_self.game.board, function(err, field) {
            if (!field)
                return; 

            _self.check(field.id, function(err, result){
                if (!result) {
                    _self.emit('game', _self.game);
                }
            });
        });
    }, 3000);
};

OnlineGame.prototype.endVoting = function() {
    if (this.voteInterval)
        clearInterval(this.voteInterval);
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
