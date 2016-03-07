"use strict";
function default_1(io, session) {
    var commands = {
        "nick": {
            numArgs: 1,
            handler: function (args, io, session, player) {
                player.nick = args[0];
                if (args[0] === "null" || args[0] === null || args[0] === "null " || args[0] === "undefined") {
                    player.nick = 'Guest';
                }
                session.players[player.uuid] = player;
                io.sockets.emit('nickname', player.nick);
            }
        },
        "clear": {
            numArgs: 0,
            handler: function (args, io, session, player) {
                session.log = "";
                player.socket.emit('clear');
            }
        },
        "help": {
            numArgs: 0,
            handler: function (args, io, session, player) {
                player.socket.emit('message', '/nick <nickname> - change your username\n /clear - clear your chat log.');
            }
        }
    };
    var isCommand = function (msg) {
        return (msg.substring(0, 1) == "/");
    };
    var run = function (player, msg) {
        var cmd = msg.substring(1, msg.length);
        var args = cmd.match(/[A-z][A-z]*/g);
        var fun = args.shift();
        commands[fun].handler(args, io, session, player);
    };
    return {
        run: run,
        isCommand: isCommand
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
//# sourceMappingURL=chat-commands.js.map