/**
 * This file defines console command logic.
 */
export default function(io, session) {
var commands:IChatCommandMap = {
	"nick": {
		numArgs: 1,
		handler: function(args, io, session, player) {
			player.nick = args[0];
			session.players[player.uuid] = player;
			io.sockets.emit('nickname', player.nick);
		}
	},
	"clear": {
		numArgs: 0,
		handler: function(args, io, session, player) {
			session.log = "";
			player.socket.emit('clear');
		}
	},
	"help": {
		numArgs: 0,
		handler: function(args, io, session, player) {
			player.socket.emit('message', '/nick <nickname> - change your username\n /clear - clear your chat log.');
		}
	}
}


var isCommand = function(msg) {
	return (msg.substring(0, 1) == "/");
}

/**
 * Runs a given command.
 * Parses a command into a name and a series of arg tokens.
 * @param  {Object}
 * @param  {String}
 */
var run = function(player:any, msg:string) {
	var cmd = msg.substring(1, msg.length);
	var args = cmd.match(/[A-z][a-z]*/g);
	var fun = args.shift();

	commands[fun].handler(args, io, session, player);
}

	return {
		run: run,
		isCommand: isCommand
	}
};

interface IChatCommand {
	numArgs: number,
	handler: (args?:any, io?:any, session?:any, player?:any) => any
}
interface IChatCommandMap {
	[command:string]:IChatCommand
}
