var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Game = require('./game');

var OnlineGame = function(options) {
    this.options = options || {};
    this.started = false;
    this.game = new Game();
    this.votes = {};
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
        return innerCallback(null);
    });
};


OnlineGame.prototype.end = function() {
    this.endVoting();
    this.started = false;
    this.emit('end', this.game);

    // Restart game after a while
    this.timer = setTimeout(this.start.bind(this), 5000);
};

OnlineGame.prototype.check = function(id, callback) {
    var _self = this;
    var innerCallback = typeof callback === 'function' ? callback : function() {};

    if (!this.started)
        return innerCallback(new Error('game not started'));

    this.game.check(id, function(err, data) {
        if (err)
            return innerCallback(err);

        if (data.winner || data.draw) {
            _self.end();
        } else {
            _self.emit('check', data);
        }

        innerCallback(null, data);
    });
};

OnlineGame.prototype.vote = function(id) {
    var _self = this;
    if (!_self.started) {
        return;
    }

    var field = _self.votes[id];
    if (field === undefined) {
        field = _self.votes[id] = {
            id: id,
            count: 0
        };
    }

    field.count += 1;

    // Start voting timeout if not started
    _self.startVoting();

    _self.emit('vote', field);
};

OnlineGame.prototype.startVoting = function() {
    var _self = this;

    // Check if voting already started
    if (_self.voteTimeout)
        return;

    var timeout = ~~ (_self.options.timeout || 3000);
    this.voteTimeout = setTimeout(function() {
        _self.maxVote(_self.votes, function(err, field) {
            if (!field)
                return;

            _self.votes = {};

            _self.check(field.id, function(err) {
                if (err)
                    return;
                _self.endVoting();
            });
        });
    }, timeout);
};

OnlineGame.prototype.endVoting = function() {
    if (this.voteTimeout) {
        clearTimeout(this.voteTimeout);
        delete this.voteTimeout;
    }
};

OnlineGame.prototype.maxVote = function(votes, callback) {
    var b, v = 0;
    for (var f in votes) {
        var field = votes[f];

        if (field.count > v) {
            b = field;
            v = field.count;
        }
    }

    return callback(null, b);
};