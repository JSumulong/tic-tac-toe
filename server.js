var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket) {
	console.log('User connected');

	socket.on('disconnect', function() {
		console.log('User disconnected');
	});

	socket.on('player move', function(squareIndex) {
		io.emit('player move', squareIndex);
	});

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
