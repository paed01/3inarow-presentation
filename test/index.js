var Lab = require('lab');
var lab = exports.lab = Lab.script();

var expect = Lab.expect;
var before = lab.before;
var after = lab.after;
var describe = lab.experiment;
var it = lab.test;

var Game = require('../lib/game');

describe('game', function() {
    describe('#inStreak', function() {
        var game = new Game();
        it('returns true if id is string and in streak', function(done) {
            expect(game.inStreak('1', 7)).to.be.ok;
            done();
        });

        it('returns true if id is numeric and streak is string', function(done) {
            expect(game.inStreak(4, '7')).to.be.ok;
            done();
        });
    });
});