/*jslint */
var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = Code.expect;

var before = lab.before;
var after = lab.after;
var describe = lab.experiment;
var it = lab.test;

var Game = require('../lib/game');

describe('game', function() {
    describe('#inStreak', function() {
        var game = new Game();
        it('returns true if id is string and in streak', function(done) {
            expect(game.inStreak('1', 7)).to.be.true();
            done();
        });

        it('returns true if id is numeric and streak is string', function(done) {
            expect(game.inStreak(4, '7')).to.be.true();
            done();
        });
    });


    // |         | Col 1| Col 2 | Col 3 |   Sum |
    // |--------:|-----:|------:|------:|------:|
    // |**Row 1**|   `1`|    `2`|    `4`|    *7*|
    // |**Row 2**|   `8`|   `16`|   `32`|   *56*|
    // |**Row 3**|  `64`|  `128`|  `256`|  *448*|
    // |*84*     |  *73*|  *146*|  *292*|  *273*|
    describe('#check', function() {

        it('returns result in callback', function(done) {
            var game = new Game();

            game.start('X', function(){
                game.check(256, function(err, result){
                    expect(err).to.not.exist();
                    expect(result).to.exist();
                    done();
                });
            });
        });

        it('returns winner in callback if X reaches 3 in a row', function(done) {
            var game = new Game();

            game.start('X', function(){
                game.checked.X = 1 + 16;
                game.checked.O = 73 + 146;

                game.check(256, function(err, result){
                    expect(err).to.not.exist();
                    expect(result.winner).to.exist();
                    expect(result.winner).to.equal('X');
                    done();
                });
            });
        });

        it('returns winner in callback if X reaches 3 in a row', function(done) {
            var game = new Game();

            game.start('O', function(){
                game.checked.X = 1 + 16;
                game.checked.O = 64 + 128;

                game.check(256, function(err, result){
                    expect(err).to.not.exist();
                    expect(result.winner).to.exist();
                    expect(result.winner).to.equal('O');
                    done();
                });
            });
        });

    });
});
