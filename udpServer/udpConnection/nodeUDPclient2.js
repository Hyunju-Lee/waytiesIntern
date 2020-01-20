#!/usr/bin/env node

var dgram = require('dgram');
var host = process.argv[2];
var port = parseInt(process.argv[3], 10);
var client = dgram.createSocket('udp4');

var connect = "connect2";

const hello = setInterval(() => {
    client = dgram.createSocket('udp4');
    console.log('send: ', connect);
    client.send(connect, 0, connect.length, port, host);

    client.on('message', function (message) {
        console.log('Get message back:', message.toString());
        client.close();
    });
}, 1000);




