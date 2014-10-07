var http = require('http');
var fs = require('fs');

http.createServer(function(req,res){
	var fileread = fs.createReadStream('./Public/index_local.html');
	fileread.pipe(res);
	//res.end('Hello Webstep');
}).listen(8080);
