Serverside game
========

Make the game serverside.

- [Game module](#game-module)
   - [Browserify](#browserify)
   - [Modify inline html](#browserify)
- [Determining the winner](#determining-the-winner)
- [Draw](#draw)

## Game module

To make the game a serverside game we can use the same CommonJS client side JavaScript for the game logic. The only thing we have to do is to make a node.js module out of `game.js`.

As a common practice node.js modules are stored in the sub-directory `/lib`. So we will make a copy of [game.js](/public/js/game.js) in the lib-folder.

Exposing a module is done by setting the `module.exports` statement to the constructor function.

Open [`/lib/game.js`](/lib/game.js) and modify it accordingly:

```javascript
var winningStreaks = [7, 56, 73, 84, 146, 273, 292, 448];
var draw = parseInt('111111111', 2);

// Constructor
var Game = function() {};

// Export the script as a module
exports = module.exports = Game;

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

// and more...
```

## Browserify