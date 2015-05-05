var http = require('http');
var filesystem = require('fs');
var url = require('url');
var Browserify = require('browserify');

var IO = require('socket.io');

var browserify = Browserify();
var jsBundle = browserify.require('./lib/game.js', {
    expose: 'game'
});

var server = http.createServer(function(req, res) {
  var reqPath = url.parse(req.url).pathname;

  var readstream;
  if (reqPath === '/'){
    readstream = filesystem.createReadStream('./public/index_local.html');
    return readstream.pipe(res);
  } else if (reqPath === '/js/game.js') {
    return jsBundle.bundle().pipe(res);
  }

  var filePath = './public' + reqPath;
  readstream = filesystem.createReadStream(filePath);

  readstream.on('error', function() {
    res.writeHead(404);
    return res.end();
  });

  if (reqPath.indexOf('/js/') === 0) {
    res.writeHead(200, { 'Content-type': 'application/json'});
  }

  readstream.pipe(res);
});

server.listen(8080, function(err) {
  console.log('Server started', err);
});

var io = IO(server);

io.on('connection', function(socket) {
  socket.emit('hello', { and: { welcome: 'to IT-huset' }});

  socket.on('check', function(data) {
    console.log('Checked', data);
  });
});












