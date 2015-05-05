var http = require('http');
var filesystem = require('fs');
var url = require('url');

var server = http.createServer(function(req, res) {
  var reqPath = url.parse(req.url).pathname;

  console.log(reqPath);

  var readstream;
  if (reqPath === '/'){
    readstream = filesystem.createReadStream('./public/index_local.html');
    return readstream.pipe(res);
  }

  var filePath = './public' + reqPath;
  readstream = filesystem.createReadStream(filePath);

  if (reqPath.indexOf('/js/') === 0) {
    res.writeHead(200, { 'Content-type': 'application/json'});
  }

  readstream.pipe(res);
});

server.listen(8080, function(err) {
  console.log('Server started', err);
});
