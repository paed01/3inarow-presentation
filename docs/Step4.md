Test and deploy
========

Test the solution.

- [Test](#test)
   - [Add test](#add-test)
   - [Run tests](#run-tests)
- [Deploy](#deploy)
   - [Heroku](#heroku)
   - [Check log](#check-log)
- [CI](#ci)
   - [Test with Travis](#test-with-travis)
   - [Client socket.io](#client-socketio)

# Test

In this solution we use [lab](https://github.com/hapijs/lab), but there are a number of testing frameworks. One of the most commonly used is [mocha](https://github.com/mochajs/mocha).

## Add test

Almost all testing modules will look under the folder `test/` in the solutions folder and execute everything.

To test the game-module we will add the file `test/index.js` with the following content:

```javascript
// Require test framework
var Lab = require('lab');
var lab = exports.lab = Lab.script();

// Require assert module
var Code = require('code');
var expect = Code.expect;

var before = lab.before;
var after = lab.after;
var describe = lab.experiment;
var it = lab.test;

var Game = require('../lib/game');

// describe -> Category or in this case the module name
describe('game', function() {

    // Test function game.inStreak
    describe('#inStreak', function() {
        var game = new Game();

        // The actual test
        it('returns true if id is string and in streak', function(done) {
            // Assert som value to be true
            expect(game.inStreak('1', 7)).to.be.true();
            done();
        });

        it('returns true if id is numeric and streak is string', function(done) {
            expect(game.inStreak(4, '7')).to.be.true();
            done();
        });

        it('return false if not in streak',function(done){
            expect(game.inStreak(8,7)).to.be.false();
            done();
        })
    });
  });
});
``

## Run tests

Npm has a command that is used to run tests: `npm test`. To define what tests should be executed when running the command you will have to modify `package.json`.

In the section `scripts` add the following section:

`"test": "node node_modules/lab/bin/lab -v"`

The package.json should look something like this:

```javascript
{
  "name": "3inarow-presentation",
  "version": "1.1.0",
  "description": "3 in a row game",
  "main": "index.js",
  "scripts": {
    "test": "node node_modules/lab/bin/lab -v",
    "start": "node index.js"
  },
  "keywords": [
    "game",
    "socket.io"
  ],
  "author": "Peter Helje & Pål Edman",
  "license": "MIT",
  "dependencies": {
    "browserify": "^10.0.0",
    "socket.io": "~1.0.6"
  },
  "devDependencies": {
    "code": "~1.3.0",
    "lab": "~5.3.0"
  }
}
```

Open a terminal and run the following command:

`npm test`

The script will run `node` with file `node_modules/lab/bin/lab` with argument `-v` (that means `--verbose`).

And the output should look something like this:

```
> 3inarow-presentation@1.1.0 test /Users/paed01/projects/3inarow-presentation
> node node_modules/lab/bin/lab -v

game
  #inStreak
    ✔ 1) returns true if id is string and in streak (5 ms)
    ✔ 2) returns true if id is numeric and streak is string (1 ms)
    ✔ 3) return false if not in streak (1 ms)

3 tests complete
Test duration: 12 ms
No global variable leaks detected
```

# Deploy

In this presentation we use heroku to host the solution.

## Heroku

To deploy to heroku the [heroku toolbelt](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) needs to be installed.

## Check log

When running in heroku the log can be tailed by running the following command in a terminal:

`heroku logs --tail`

# CI

Continuous integration.

## Test on commit

Open a browser and navigate to [Travis](https://travis-ci.org/).

1. Sign in with your Github account
2. Find your open source repository
3. Flick the repository switch

Add a file called `.travis.yml` with the following content:

``yaml
language: node_js
node_js:
- "0.12"
```

Push the yaml-file and have a look in travis to see your repository being built.

Add the __built success__-badge to your readme.

## Deploy on successfull build

[See here](https://devcenter.heroku.com/articles/github-integration)
