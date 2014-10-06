var http = require('http');
var fs = require('fs');

http.createServer(function(req,res){
	var fileread = fs.createReadStream('./Public/Demo.html');
	fileread.pipe(res);
//	res.end('Hello Diversify');
}).listen(8080);
console.log();
console.log("http://localhost:8080/\nCTRL + C to shutdown");
