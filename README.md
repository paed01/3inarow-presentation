3inone-presentation
========

Diversify presentation of node.js and socket.io

## Table of Contents

- Presentation
    - [Step 1 - The http server](/docs/Step1.md)
    - [Step 2 - The game](/docs/Step2.md)
    - [Step 3 - Serverside game](/docs/Step3.md)
- [Install](#install)
- [The game](#the-game)

## Install
1. Install [git](http://git-scm.com/downloads)
2. Install [node and npm](http://nodejs.org) 
3. Open terminal/cmd
4. Run: `git clone git@github.com:paed01/3inarow-presentation.git`
5. Run: `cd 3inarow-presentation`
6. Run: `npm install`
7. Start server with: `node index.js`

## The server
The client in this case is the browser. The server is a http server hosted in node:

```javascript

var http = require('http');
http.createServer(function(req, res){
    res.end('Under construction')    
});

server.listen(8080);

```

When browsing to http://localhost:8080 you will end up with the text `Under construction`.

To serve the files we need to alter the "handler", i.e. the function argument in `http.createServer`

```javascript

var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
    var filereader = fs.createReadStream('./public/index.html');
    filereader.pipe(res);
});

server.listen(8080);

```

The client side javascripts also needs to be passed from the server to the client. The first argument in the "handler" is the request coming from the client. The request have a property called url that we can use to route to the proper file:

```javascript

var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
    // Root
    if (req.url == '/') {
        var filereader = fs.createReadStream('./public/index.html');
        filereader.pipe(res);
    } else if (req.url.indexOf('/js/') === 0) {
        // Build path
        var file = __dirname + '/public' + req.url;

        fs.fileExists(file, function(err, exists) {
            if (!exists) {
                res.writeHead(404, req.url + 'not found');
                return res.end();
            }

            var filereader = fs.createReadStream(file);
            response.writeHead(200, {
                'Content-Type': 'application/javascript'
            });
            filereader.pipe(res);
        });
    }
});

server.listen(8080);
```


# The game

## Board

The board consist of 3 by 3 fields. Each field will have an id:

|         | Col 1| Col 2 | Col 3 |   Sum |
|--------:|-----:|------:|------:|------:|
|**Row 1**|   `1`|    `2`|    `4`|    *7*|
|**Row 2**|   `8`|   `16`|   `32`|   *56*|
|**Row 3**|  `64`|  `128`|  `256`|  *448*|
|*84*     |  *73*|  *146*|  *292*|  *273*|

## Who wins

The sum of the winning streaks are calculated by the sum of the ids, e.g.:

|         | Col 1| Col 2 | Col 3 |   Sum |
|--------:|-----:|------:|------:|------:|
|**Row 1**|   `X`|    `O`|    `O`|       |
|**Row 2**|      |    `X`|       |       |
|**Row 3**|   `X`|    `O`|    `X`|       |
|**Sum**  |      |       |       |  *273*|


### Determine the winner
The diagonal from top left to bottom right sums up to *273*.

```javascript
var streaks = [7, 56, 73, 84, 146, 273, 292, 448];

// The participant signs (X, O) have there own sum of ids
var sumX = (1 + 16 + 64 + 256);

// The sum is bit-compared with the streak sums
if ((sumX & 273) === 273) {
    console.log('X wins with top left diagonal streak');
} else if ((sumX & 146) === 146) {
    console.log('X rules by filling column 2!');
)

```

Or more likely:

```javascript
var streaks = [7, 56, 73, 84, 146, 273, 292, 448];

// The participant signs (X, O) have there own sum of ids
var sumX = (1 + 16 + 64 + 256);
var sumO = (2 + 4 + 128);

// The sum is bit-compared with the streak sums
for (var i in streaks) {
    var streak = streaks[i];
    if ((sumX & streak) === streak) {
        console.log('X wins');
        break;
    } else if ((sumO & streak) === streak) {
        console.log('O rules!');
        break;
    ) else if (sumX + sumO === 511) {
        console.log('It\'s a draw!');
        break;
    }
}


```


A draw is calculated from the sum of all checked ids, *511*.

|         | Col 1| Col 2 | Col 3 |
|--------:|-----:|------:|------:|
|**Row 1**|   `X`|    `O`|    `O`|
|**Row 2**|   `O`|    `X`|    `X`|
|**Row 3**|   `X`|    `O`|    `O`|

# Notes

## Lessons learned
In Chrome the socket.io-client disconnects if an error occur in the client-side javascript. This causes the server to reissue a new connection, hence the board is reset.