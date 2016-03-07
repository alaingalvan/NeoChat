"use strict";
var Express = require('express');
var Http = require('http');
var Sockets = require('socket.io');
var chat_session_1 = require('./chat-session');
var chat_commands_1 = require('./chat-commands');
var app = Express();
var http = Http.createServer(app);
var io = Sockets(http);
var commands = chat_commands_1.default(io, chat_session_1.default);
app.use(Express.static(__dirname + '/public'));
app.get('/chatapp', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
io.on('connection', function (socket) {
    var player;
    socket.on('register', function (uuid) {
        if (!(player = chat_session_1.default.players[uuid])) {
            chat_session_1.default.count++;
            player = chat_session_1.default.players[uuid] = {
                uuid: uuid,
                tabs: 0,
                nick: 'guest' + chat_session_1.default.count,
                socket: socket
            };
            socket.emit('message', chat_session_1.default.log);
            io.sockets.emit('nickname', player.nick);
        }
        else {
            player = chat_session_1.default.players[uuid];
            socket.emit('message', chat_session_1.default.log + '\nWelcome back ' + player.nick + '!');
            if (!player.disconnected) {
                player.tabs++;
                socket.disconnect();
            }
        }
        if (player.disconnected) {
            clearTimeout(player.timeout);
            player.disconnected = false;
        }
        chat_session_1.default.players[uuid] = player;
    });
    socket.on('disconnect', function (type) {
        if (type == 'booted' && player.tabs > 0)
            return;
        player.disconnected = true;
        player.timeout = setTimeout(function () {
            if (player.disconnected) {
                delete chat_session_1.default.players[player.uuid];
                chat_session_1.default.count--;
            }
        }, 2000);
    });
    socket.on('message', function (msg) {
        if (!commands.isCommand(msg)) {
            var out = player.nick + ': ' + msg;
            io.emit('message', out);
            chat_session_1.default.log += out + "\n";
        }
        else
            commands.run(player, msg);
    });
});
var port = 8083;
http.listen(port);
console.log('Chat App Online @ localhost:' + port);
//# sourceMappingURL=server.js.map