Step 1 - The http server
========

- [File structure](#file-structure)
- [Create a http-server with node.js](#the-server)
- [The html](#the-html)
- [JavaScript (CommonJS)](#javascript-commonjs)
- [Styles, fonts, less and scss](#styles-fonts-less-and-scss)

## File structure
We start with a number of files that will represent a web-page.

- public
    - fonts
    - js
        - `game.js`
    - less
    - scss
    - styles
    - `index.html`
- `index.js`

## The server

The client in this case is the browser. The server is a http server hosted in node:

```javascript

var http = require('http');
var server = http.createServer(function(req, res){
    res.end('Under construction')    
});

server.listen(8080);

```

Save the file in e.g. `demo.js`. Start the server by opening Git Bash and type:

`node demo.js`

When browsing to http://localhost:8080 you will end up with the text `Under construction`.

## The html

To serve the files we need to alter the "handler", i.e. the function argument in `http.createServer`

```javascript

var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    var filereader = fs.createReadStream('./public/index.html');
    filereader.pipe(res);
});

server.listen(8080);

```

## JavaScript (CommonJS)

The client side javascripts also needs to be passed from the server to the client. The first argument in the "handler" is the request coming from the client. The request have a property called url that we can use to route to the proper file:

```javascript

var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
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

## Styles, fonts, less and scss

Since one of us have smaller brother that is an Art Director the brother was forced to do the design. The problem is that Art Directors use a lot of css-magic, we mean a lot! Thank you Martin. So the next step is to make the server serve styles, fonts, less and scss(?).

But since this is a node.js solution this is a minor modification:

```javascript

var http = require('http');
var fs = require('fs');
var url = require('url');

var server = http.createServer(function(req, res) {
    // Root
    if (req.url == '/') {
        var filereader = fs.createReadStream('./public/index.html');
        filereader.pipe(res);
    } else if (req.url.indexOf('/js/') === 0) {
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
    } else { // Serve all other files found in public
        var reqUrl = url.parse(req.url);
        var file = __dirname + '/public' + reqUrl.pathname;

        fs.fileExists(file, function(err, exists) {
            if (!exists) {
                res.writeHead(404, req.url + 'not found');
                return res.end();
            }

            var filereader = fs.createReadStream(file);
            response.writeHead(200);
            filereader.pipe(res);
        });
    }
});

server.listen(8080);
```

We added a new module `url`. It is used to parse the request url since styles tend to use querystring parameters when fetching other styles. The querystrings are ignored.

[Next >>](/docs/Step2.md)