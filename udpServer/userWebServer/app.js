/* socket\app.js */
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// import { pi, square, Person } from './test.js';
const abc = require('../udpConnection/nodeUDPclient');
console.log(abc.globalMessage);

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => { io.emit('chat message', msg); });
    socket.on('disconnect', () => { console.log('user disconnected'); });
});

http.listen(3001, () => { console.log('Connected at 3001'); });