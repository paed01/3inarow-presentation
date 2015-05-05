var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 8080;

var server = http.createServer(function(req, res) {
    var reqPath = url.parse(req.url).pathname;
    var filereader;
    if (reqPath === '/') {
        filereader = fs.createReadStream('./public/index_local.html');
        return filereader.pipe(res);
    }
    var file = __dirname + '/public' + reqPath;
    filereader = fs.createReadStream(file);
    filereader.on('error',function(){
        res.writeHead(404);
        res.end();
    });

    if (reqPath.indexOf('/js/') === 0) {
        res.writeHead(200, {
            'Content-Type': 'application/javascript'
        });
    } else if (req.url.indexOf('/styles/') === 0) {
        res.writeHead(200, {
            'Content-Type': 'text/css'
        });
    }

    return filereader.pipe(res);
});

server.listen(port, function() {
    console.log('Static file server running at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown');
});
