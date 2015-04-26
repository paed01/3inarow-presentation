var http = require('http');
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 8080

var server = http.createServer(function(req, res) {
    if (req.url == '/') {
        var filereader = fs.createReadStream('./public/index_local.html');
        return filereader.pipe(res);
    } else if (req.url.indexOf('/js/') === 0) {
        var reqUrl = url.parse(req.url);
        var file = __dirname + '/public' + reqUrl.pathname;
        var filereader = fs.createReadStream(file);
        res.writeHead(200, {
            'Content-Type': 'application/javascript'
        });
        return filereader.pipe(res);
    } else {
        var reqUrl = url.parse(req.url);
        var file = __dirname + '/public' + reqUrl.pathname;
        var filereader = fs.createReadStream(file);
        return filereader.pipe(res);
    }
    return res.end(); 
});

server.listen(port, function() {
    console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
});
