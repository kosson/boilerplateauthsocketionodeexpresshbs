var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socketio')(server);

app.use(express.static('frontend'));
