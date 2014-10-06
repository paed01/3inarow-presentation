var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 8080

var Browserify = require('browserify');

var server = http.createServer(function(req, res) {
    if (req.url == '/') {
        var filereader = fs.createReadStream('./public/index_local.html');
        filereader.pipe(res);
    } else if (req.url == '/game.js') {
        var browserify = Browserify();
        browserify.require('./lib/game.js', {
            expose: 'game'
        });
        browserify.bundle().pipe(res);
    } else {
        var reqUrl = url.parse(req.url);
        return fs.readFile(__dirname + '/public' + reqUrl.pathname, function(err, content) {
            if (err) {
                res.writeHead(404);
                return res.end(err.message);
            }
            res.end(content);
        });
    }
});

server.listen(port, function() {
    console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
});