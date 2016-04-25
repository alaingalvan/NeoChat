/**
 * This file defines console command logic.
 */
 var request = require('request');


import {IUser} from './chat-session';
import {IChannel} from './chat-session';
export default function(io, session) {
var commands:IChatCommandMap = {
	"nick": {
		numArgs: 1,
		handler: function(args, io, session, player) {


			var newNick = args[0]
			var puser : string;


			for (puser in session.users)
			{
				if(newNick == session.users[puser].nick)
				{
					player.socket.emit('message', newNick + ' nick already taken.', player.currentChat)
					newNick = player.nick
					return;
				}
			}

			player.nick = newNick;
			io.sockets.emit('nickname', player.nick, player.currentChat);
		}
	},
	"clear": {
		numArgs: 0,
		handler: function(args, io, session, player) {
			player.socket.emit('clear');
		}
	},
	"help": {
		numArgs: 0,
		handler: function(args, io, session, player) {
			player.socket.emit('message', '/nick <nickname> - change your username\n /clear - clear your chat log.', player.currentChat);
		}
	},
	"list": {
		numArgs: 1,
		handler: function(args, io, session, player) {
			var channelList = [];
			console.log(session.channels)

			if (args[0] != null)
			{
				var allChannels = Object.getOwnPropertyNames(session.channels);
				for (var i = 0; i < allChannels.length; i++)
				 {
					 if (allChannels[i].indexOf(args[0]) > -1)
					 {
						 channelList.push(allChannels[i]);
					 }
				 }
			}
			else
			{
				channelList = Object.getOwnPropertyNames(session.channels);
			}
			player.socket.emit('message', 'Channel List: '+ channelList, player.currentChat);
		}
	},
	"quit": {
		numArgs: 0,
		handler: function(args, io, session, player) {
			io.sockets.emit('message', player.nick + ' has quit...', player.currentChat);
			player.quit = true;
		}
	},
	"join": {
		numArgs: 1,
		handler: function(args, io, session, player) {
			player.quit = false;
			if (args[0] != '')
			{
				//anyone will be able to join mod channel unless I put a block on mod via player type
				var allChans : string;
				for ( allChans in session.channels)
				{
					if(allChans.substring(1, allChans.length) == args[0])
					{
						player.currentChat = '#'+allChans.substring(1, allChans.length);
						break;
					}
				}

			}
			console.log(player.currentChat)
			player.socket.emit('join',player.currentChat)
			io.sockets.emit('message', player.nick + ' has joined!!!', player.currentChat);

		}
	},
	"promote": {
			numArgs: 1,
			handler: function(args, io, session, player) {
				var promoplayer = args.join().replace(',','')
				var playerFound = '';
				var promoUser : IUser;
				var found : boolean = false;

				if (player.type == 'mod' || player.type == 'sysop')
				{
					var puser : string
					for (puser in session.users)
					{
						if (promoplayer == session.users[puser].nick && promoplayer != player.nick)
						{
							playerFound = session.users[puser].nick + ' has been turned into a mod by ' + player.nick;
							promoUser = session.users[puser] ;
							session.users[puser].type = 'mod';
							found = true;
							break;
						}
						else
						{
							playerFound = 'You have failed looking for ' + promoplayer
						}
					}

					if (found)
					{
						io.sockets.emit('message', playerFound , player.currentChat);
					}
					else{
						player.socket.emit('message', playerFound , player.currentChat);
					}
				}
				else{
					playerFound = 'Only mods or sysop can promote';
					player.socket.emit('message', playerFound , player.currentChat);
				}
			}
		},
		"demote": {
				numArgs: 1,
				handler: function(args, io, session, player) {
					var promoplayer = args.join().replace(',','')
					var playerFound = '';
					var promoUser : IUser;
					var found : boolean = false;

					if (player.type == 'sysop')
					{
						var puser : string
						for (puser in session.users)
						{
							if (promoplayer == session.users[puser].nick && promoplayer != player.nick && session.users[puser].type != 'sysop')
							{
								playerFound = session.users[puser].nick + ' has been turned into a user by ' + player.nick;
								promoUser = session.users[puser] ;
								session.users[puser].type = 'user';
								found = true;
								break;
							}
							else
							{
								playerFound = 'You have failed looking for ' + promoplayer + ' or they are a System Operator'
							}
						}

						if (found)
						{
							io.sockets.emit('message', playerFound , player.currentChat);
						}
						else{
							player.socket.emit('message', playerFound , player.currentChat);
						}
					}
					else{
						playerFound = 'Only sysop can demote';
						player.socket.emit('message', playerFound , player.currentChat);
					}
				}
			},
			"msg": {
				numArgs: 2,
				handler: function(args, io, session, player) {

					if (!isNaN(args[1]))
					{
						args[0] += args[1];
						args[1] = args[2];
					}
					var playerName : string = args[0];
					var privateMessage : string = '';
					var msgToPlayer : IUser;
					var puser : string
					var msgString : string
					for (msgString in args)
					{
						if (msgString != '0')
						{
							privateMessage += ' '+ args[msgString]
						}
					}



					if (args[0].toLowerCase() == 'all' && player.type == 'sysop')
					{
						for (puser in session.users)
						{
								session.users[puser].socket.emit('message','*** System Operator '+player.nick + ': ' + privateMessage + ' ***', session.users[puser].currentChat)
							}
					}



					for (puser in session.users)
					{
						if(playerName == session.users[puser].nick)
						{
							msgToPlayer = session.users[puser]
							player.socket.emit('message','(msg) '+player.nick + ' -> ' + msgToPlayer.nick+ ': ' + privateMessage, player.currentChat)
							msgToPlayer.socket.emit('message','(msg) from: '+player.nick +': ' + privateMessage, msgToPlayer.currentChat)
							break;
						}
					}
				}
			},
			"leave": {
				numArgs: 0,
				handler: function(args, io, session, player) {
					player.chatSession = '#anouncements'
					player.socket.emit('message', 'You have moved to announcements', player.currentChat);
					player.socket.emit('leave')
				}
			},
			"create": {
				numArgs: 1,
				handler: function(args, io, session, player) {

					if (player.type == 'user')
					{
						session.channels['##'+args[0]] = {
							type : player.type,
							messages: new Array()
						}
						io.sockets.emit('createTab', '##'+args[0])
					}
					else{
						session.channels['#'+args[0]] = {
							type : player.type,
							messages: new Array()
						}
						io.sockets.emit('createTab', '#'+args[0])
					}
					io.sockets.emit('sync-store', JSON.stringify(session));

				}
			},
			"delete": {
				numArgs: 1,
				handler: function(args, io, session, player) {

					if (player.type == 'sysop')
					{
						delete session.channels['##'+args[0]]
						delete session.channels['#'+args[0]]
						io.sockets.emit('delete-tab', '##'+args[0])
						io.sockets.emit('delete-tab', '#'+args[0])
						io.sockets.emit('sync-store', JSON.stringify(session));
					}
				}
			},
			"admin": {
				numArgs: 1,
				handler: function(args, io, session, player) {

					if(args[0] == 'password')
					{
						player.socket.emit('admin')
						io.sockets.emit('sync-store', JSON.stringify(session));
					}
			}
		},
		"time": {
			numArgs: 1,
			handler: function(args, io, session, player) {
				var cDate;

				request('http://localhost:8082/api/all', function (error, response, body) {
						if (!error && response.statusCode == 200) {
								console.log(body) // Print the google web page.
								player.socket.emit('message', 'The current date is ' + body, player.currentChat); // figure out why body doesnt correct time
								// console.log(response)
						 }
						 else {
							 console.log(error);
							//  console.log(response.statusCode)
						 }
				})
		}
	},
	"wearther": {
		numArgs: 1,
		handler: function(args, io, session, player) {

			request('http://localhost:8082/api/all', function (error, response, body) {
					if (!error && response.statusCode == 200) {
							console.log(body) // Print the google web page.
							player.socket.emit('message', 'The current date is ' + body, player.currentChat); // figure out why body doesnt correct time
							// console.log(response)
					 }
					 else {
						 console.log(error);
					 }
			})

	}
}

}


var isCommand = function(msg) {
	// console.log("\\")
	return (msg.substring(0, 1) == "/" || msg.substring(0, 2) == "\\:");
}

/**
 * Runs a given command.
 * Parses a command into a name and a series of arg tokens.
 * @param  {Object}
 * @param  {String}
 */
var run = function(player:any, msg:string) {
	var cmd = msg.substring(1, msg.length);
	var args = cmd.match(/[0-9A-z][a-z:]*/g);
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

//if not in command list print not in commant



/* Old broken code

//Loop through objects
for (var i = 1; i < Object.getOwnPropertyNames(session.users).length - 1; i++)
{
	console.log( Object.getOwnPropertyNames(session.users)[i])
	if (promoplayer == session.users[Object.getOwnPropertyNames(session.users)[i]].nick)
	{
		playerFound = promoplayer;

	}
	else
	{
		playerFound = 'you have failed looking for ' + promoplayer + '------' + args.join().replace(',','')
	}
}


//combine first 2 element
		console.log(args.join().replace(',',''))



		console.log(privateMessage);
		console.log(args.length);
		console.log(args);

		// for(var i = 1; i > args.length - 1; i++)
		// {
		// 	privateMessage += args[i]
		// }


		// var msgString : string
		// for (msgString in args)
		// {
		// 	if (msgString != '0')
		// 	{
		// 		privateMessage += ' '+ args[msgString]
		// 	}
		// }


*/
