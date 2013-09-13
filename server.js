var express = require('express')
var io = require('socket.io');
var path = require('path');

var app = express();
var server = app.listen(888);
var io = io.listen(server);

//filename = __dirname + '/var/log/system.log';
//filename = '/var/log/mpd.log';
filename = '/var/log/radius.log';


app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});






function nl2br (str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}


io.sockets.on('connection', function (socket) {
    var endpoint = socket.manager.handshaken[socket.id].address;
    //console.log('Client connected from: ' + endpoint.address + ":" + endpoint.port);

    var spawn = require('child_process').spawn;
    var tail = spawn('tail', ['-f', filename]);

    tail.stdout.on('data', function (data) {
        var IP = endpoint.address;
        //IP = IP.split('.');
        //io.sockets.emit('log', IP);

        RegE = /^((192.168.0.\d{1,3}))$/
        if(RegE.test(IP))
         socket.emit('log', nl2br(data.toString('utf8')));
        else {
         socket.emit('log', 'access denied!');
         socket.disconnect();
        }
    });

    

    socket.on('disconnect', function (socket){
	tail.kill();
    })
});


console.log('Started Log TAILER');