var dgram=require('dgram');
var server=dgram.createSocket('udp4');
var port = 4000;

var fs = require('fs');
var messageString = "";

server.on('listening',function(){
        var address=server.address();
        console.log('server listening on ' + address.address+':'+address.port);
});

server.bind(port);

server.on('message', function (message, rinfo) {
    console.log('server got message:' + message);
    console.log('server got from: ' + rinfo.address + ' port:' + rinfo.port);
    console.log('send: ', messageString);
    server.send(messageString, 0, messageString.length, rinfo.port, rinfo.address);
});

server.on('close', function() {
    console.log('close event');
});

const updatemessage = setInterval(() => {
    fs.readFile('../buff.txt', 'utf8', function(err, data){
        console.log("read file.. : ", data);
        messageString = data;
    });
}, 3000);