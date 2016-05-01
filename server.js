"use strict";
var Express = require('express');
var Http = require('http');
var Sockets = require('socket.io');
var chat_session_1 = require('./chat-session');
var chat_commands_1 = require('./chat-commands');
var api = require('./api');
var app = Express();
var http = Http.createServer(app);
var io = Sockets(http);
var commands = chat_commands_1.default(io, chat_session_1.default);
app.use(Express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use('/api', api.api);
app.get('/api', function (req, res) {
    console.log('chat');
    res.sendFile(__dirname + '/public/error.html');
});
io.on('connection', function (socket) {
    var player;
    socket.on('sync-store', function () {
        socket.emit('sync-store', JSON.stringify(chat_session_1.default));
    });
    socket.on('register', function (uuid, uName) {
        if (uName.length < 2) {
            uName = 'guest' + (chat_session_1.default.count + 1);
        }
        var puser;
        var tempNick;
        for (puser in chat_session_1.default.users) {
            if (uName == chat_session_1.default.users[puser].nick) {
                tempNick = uName;
                uName = 'guest' + (chat_session_1.default.count + 1);
            }
        }
        socket.emit('sync-store', JSON.stringify(chat_session_1.default));
        if (!(player = chat_session_1.default.users[uuid])) {
            chat_session_1.default.count++;
            player = chat_session_1.default.users[uuid] = {
                uuid: uuid,
                tabs: 0,
                nick: uName,
                socket: socket,
                type: 'user',
                currentChat: '#soccer',
                quit: false
            };
            io.sockets.emit('nickname', player.nick);
            if (player.nick == 'guest1') {
                player.type = 'sysop';
            }
        }
        else {
            player = chat_session_1.default.users[uuid];
            socket.emit('message', 'System: Welcome back ' + player.nick + '!', '#anouncements');
            if (!player.disconnected) {
                player.tabs++;
                socket.disconnect();
            }
        }
        if (player.disconnected) {
            clearTimeout(player.timeout);
            player.disconnected = false;
        }
        chat_session_1.default.users[uuid] = player;
        io.sockets.emit('addUser', player.nick);
    });
    socket.on('disconnect', function (type) {
        if (type == 'booted' && player.tabs > 0)
            return;
        player.disconnected = true;
        player.timeout = setTimeout(function () {
            if (player.disconnected) {
                delete chat_session_1.default.users[player.uuid];
                chat_session_1.default.count--;
            }
        }, 2000);
        io.sockets.emit('removeUser', player.nick);
    });
    socket.on('message', function (msg, channel) {
        if (!commands.isCommand(msg) && !player.quit) {
            var out = player.nick + ': ' + msg;
            io.emit('message', out, channel);
            var curChannel = chat_session_1.default.channels[channel];
            if (curChannel)
                curChannel.messages.push(out);
            console.log(chat_session_1.default.channels[channel]);
        }
        else if (commands.isCommand(msg)) {
            commands.run(player, msg);
        }
        else {
            return;
        }
    });
    socket.on('channelChange', function (channel) {
        player.currentChat = channel;
        console.log(player.nick + ' moved to channe: ' + player.currentChat);
    });
});
var port = 8082;
http.listen(port);
console.log('Chat App Online @ localhost:' + port);
//# sourceMappingURL=server.js.map