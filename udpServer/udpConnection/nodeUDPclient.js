#!/usr/bin/env node

var dgram = require('dgram');
var host = process.argv[2];
var port = parseInt(process.argv[3], 10);
var client = dgram.createSocket('udp4');
var connect = "connect";
var globalMessage = "a";

//******************************************* */
/* socket\app.js */
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => { io.emit('chat message', msg); });
    socket.on('disconnect', () => { console.log('user disconnected'); });
});

http.listen(3001, () => { console.log('Connected at 3001'); });

//******************************************* */

const connectMessage = setInterval(() => {
    client = dgram.createSocket('udp4');
    console.log('send: ', connect);
    client.send(connect, 0, connect.length, port, host);

    client.on('message', function (message) {
        console.log('Get message back:', message.toString());
        globalMessage = message.toString();
        io.emit('chat message', globalMessage);

        client.close();
    });
}, 200);