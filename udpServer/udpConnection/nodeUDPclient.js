#!/usr/bin/env node

var dgram = require('dgram');
var host = process.argv[2];
var port = parseInt(process.argv[3], 10);
var client = dgram.createSocket('udp4');
var connect = "connect";
var globalMessage = "";

var express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine','ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.static('views'));

//******************************************* */
/* socket\app.js */
app.get('/', (req, res) => { res.sendFile('/index.html'); });

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => { io.emit('chat message', msg); });
    socket.on('disconnect', () => { console.log('user disconnected'); });
});

http.listen(3001, () => { console.log('Connected at 3001'); });

//********************************************/

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

const connectMessage = setInterval(() => {
    client = dgram.createSocket('udp4');
    console.log('send: ', connect);
    client.send(connect, 0, connect.length, port, host);

    var uint8View;
    var arrbuffer;

    client.on('message', function (buffer) { //message is buffer
        arrbuffer = toArrayBuffer(buffer);

        //* binary데이터를 다시 html로 보여줄 수 있도록 재구성 */
        uint8View = new Uint8Array(arrbuffer);
        if((uint8View[384]>>1)%2 == 1){
            globalMessage = globalMessage.concat('북직G ');
        }if((uint8View[384]>>0)%2 == 1){
            globalMessage = globalMessage.concat('북직Y ');
        }if((uint8View[384]>>2)%2 == 1){
            globalMessage = globalMessage.concat('북좌G ');
        }if((uint8View[384]>>5)%2 == 1){
            globalMessage = globalMessage.concat('북보G ');
        }if((uint8View[385]>>1)%2 == 1){
            globalMessage = globalMessage.concat('동직G ');
        }if((uint8View[385]>>0)%2 == 1){
            globalMessage = globalMessage.concat('동직Y ');
        }if((uint8View[385]>>2)%2 == 1){
            globalMessage = globalMessage.concat('동좌G ');
        }if((uint8View[385]>>5)%2 == 1){
            globalMessage = globalMessage.concat('동보G ');
        }if((uint8View[386]>>1)%2 == 1){
            globalMessage = globalMessage.concat('남직G ');
        }if((uint8View[386]>>0)%2 == 1){
            globalMessage = globalMessage.concat('남직Y ');
        }if((uint8View[386]>>2)%2 == 1){
            globalMessage = globalMessage.concat('남좌G ');
        }if((uint8View[386]>>5)%2 == 1){
            globalMessage = globalMessage.concat('남보G ');
        }if((uint8View[387]>>1)%2 == 1){
            globalMessage = globalMessage.concat('서직G ');
        }if((uint8View[387]>>0)%2 == 1){
            globalMessage = globalMessage.concat('서직Y ');
        }if((uint8View[387]>>2)%2 == 1){
            globalMessage = globalMessage.concat('서좌G ');
        }if((uint8View[387]>>5)%2 == 1){
            globalMessage = globalMessage.concat('서보G ');
        }
        console.log(globalMessage);
        console.log('Get message back:', uint8View[384], uint8View[385], uint8View[386], uint8View[387]);
        // globalMessage = buffer.toString();
        io.emit('chat message', globalMessage);
        globalMessage = "";

        client.close();
    });
}, 199);