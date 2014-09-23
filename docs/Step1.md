Step 1
========
# Presentation

- [1. Create a http-server with node.js](#the-server)


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