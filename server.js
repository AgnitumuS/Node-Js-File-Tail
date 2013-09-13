
//Include Required LIBS
var express = require('express')
var io = require('socket.io');
var path = require('path');

//begin Config
var ListenPort = 888;
var TailedFile = '/var/log/messages';
var IpRule = /^((192.168.0.\d{1,3}))$/;
//end Config 

var app = express();
var server = app.listen(listenPort);
var io = io.listen(server);

filename = TailedFile;

//If Open http://server:ListenPort Put into Client Stream index.html file

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});


function nl2br (str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}


io.sockets.on('connection', function (socket) {
    var endpoint = socket.manager.handshaken[socket.id].address;

    var spawn = require('child_process').spawn;
    var tail = spawn('tail', ['-f', filename]);

    tail.stdout.on('data', function (data) {
        var IP = endpoint.address;
/*block Acces By IP*/
        RegE = IpRule;
        if(RegE.test(IP)) //If ip not in IpRule Access Denied!
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
