/*global $:false */
$(function() {
    var $wr = $('body');

    var Game = require('game');
    var game = new Game();
    var socket = io();

    // Game cell events
    $wr.on('reset', 'a.game', function(e) {
        $(this).attr('class', 'game start');
    });

    $wr.on('check', 'a.game:not(.disabled)', function(e, data) {
        var $this = $(this);
        if (data.sign == 'X') {
            $this.addClass("cross");
        } else if (data.sign == 'O') {
            $this.addClass("circle");
        }
        $this.removeClass('start').addClass('disabled');
    });

    $wr.on('winner', 'a.game', function(e, data) {
        var $this = $(this);
        var id = $this.closest('.col4').attr('rel');
        if (game.inStreak(id, data.streak)) {
            $this.addClass('winner');
        }
        $this.addClass('disabled');
    });

    $wr.on('draw', 'a.game', function(e, data) {
        $(this).addClass('draw disabled');
    });

    $wr.on('click', 'a.game', function(e) {
        var $this = $(this);
        var id = $this.closest('.col4').attr('rel');
        socket.emit('check', {
            id: id
        });
    });

    $wr.on('setgame', 'a.game', function(e, gamedata) {
        var $this = $(this);
        var id = $this.closest('.col4').attr('rel');

        var check = {};
        if (game.inStreak(id, gamedata.game.checked.X)) {
            check.sign = 'X';
        } else if (game.inStreak(id, gamedata.game.checked.O)) {
            check.sign = 'O';
        }

        if (check.sign) {
            $this.trigger('check', check);
            $('.gamevotes').trigger('setvote');
        } else if (gamedata.votes) {
            $this.find('.gamevotes').trigger('setvote', gamedata.votes[id]);
        }
    });

    // Title events
    $wr.on('restart', '.capture', function(e, gamedata) {
        $(this).html(gamedata.sign + ' starts');
    });

    $wr.on('setgameon', '.capture', function(e, gamedata) {
        $(this).html('Game on ' + gamedata.game.sign);
    });

    $wr.on('draw', '.capture', function(e, result) {
        $(this).html('It is a draw!');
    });

    $wr.on('winner', '.capture', function(e, result) {
        $(this).html(result.winner + ' wins!');
    });

    // Voting label events
    $wr.on('setvote', '.gamevotes', function(e, field) {
        var $this = $(this);
        if (!field || field.count === 0) {
            $this.html('').addClass('hidden');
        } else {
            $this.html(field.count).removeClass('hidden');
        }
    });

    // Game events
    $wr.on('start', function(e, gamedata) {
        $('a.game').trigger('reset');

        $('.capture').trigger('restart', gamedata);
    });

    $wr.on('gameover', function(e, gamedata) {
        var result = gamedata.result;

        $('a.game').trigger('setgame', {
            game: gamedata
        });

        if (result.draw) {
            $('.capture').trigger('draw', result);
            $('a.game').trigger('draw', result);
        } else {
            $('.capture').trigger('winner', result);
            $('a.game').trigger('winner', result);
        }
    });

    $wr.on('game', function(e, gamedata) {
        $('.capture').trigger('setgameon', gamedata);
        $('a.game').trigger('setgame', gamedata);
    });

    // Socket events
    socket.on('game', function(gamedata) {
        $wr.trigger('game', gamedata);
    });

    socket.on('start', function(gamedata) {
        $wr.trigger('start', gamedata);
    });

    socket.on('end', function(gamedata) {
        $wr.trigger('gameover', gamedata);
    });

    socket.on('vote', function(field) {
        $('.col4[rel=' + field.id + '] .gamevotes').trigger('setvote', field);
    });
});