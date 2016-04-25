/**
* Sockets Chat App
* By Francisco Ortega (http://franciscoraulortega.com/), Alain Galvan (https://Alain.xyz)
* Visit the page, and you'll be given a unique id and a default username you can rename with /nick <newname>
* All previous messages in the chat are saved on the server.
*/

import * as Express from 'express';
import * as Http from 'http';
import * as Sockets from 'socket.io';

import chatSession from './chat-session';
import Commands from './chat-commands';


// Mongo
import * as Mongdb from 'mongodb';






//chat app
var api = require('./api');
var app = Express();
var http = Http.createServer(app);
var io = Sockets(http);
//Bind Chat Commands Map to Socket Session
var commands = Commands(io, chatSession);

// Routes
// Route all static files from the current directory + /public
// Route /chatapp to curdir + public/index.html
app.use(Express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use('/api',api.api)
app.get('/api', (req, res) => {
  // res.sendFile(__dirname + '/public/index.html');
  console.log('chat');
  res.sendFile(__dirname + '/public/error.html');
});


//Using routes to send post/get
// app.get('/chat', function(req,res){
//   var response = {
//     usernametext:req.query.username
//   }
//   res.sendFile(__dirname + '/public/chat.html');
// });
//http://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm




// Sockets
io.on('connection', (socket) => {

  var player;

  socket.on('sync-store', () => {
    socket.emit('sync-store', JSON.stringify(chatSession));
  })

  socket.on('register', (uuid: string, uName:string) => {
    if (uName.length < 2)
    {
      uName = 'guest' +(chatSession.count + 1)
    }

    var puser : string;
    var tempNick : string;


    for (puser in chatSession.users)
    {
      if(uName == chatSession.users[puser].nick)
      {
        tempNick = uName;
        uName = 'guest' + (chatSession.count + 1)

      }
    }

    socket.emit('sync-store', JSON.stringify(chatSession));
    // If there doesn't already exist a player in the chat session store
    if (!(player = chatSession.users[uuid])) {

      // Create a new player and add them to the chat.
      chatSession.count++;
      player = chatSession.users[uuid] = {
        uuid: uuid,
        tabs: 0,
        nick: uName,
        socket: socket,
        type: 'user',
        currentChat: '#soccer',
        quit: false
      };

      socket.emit('message', tempNick + ' nick already taken.', player.currentChat)
      io.sockets.emit('nickname', player.nick);



      if (player.nick == 'guest1')
      {
        player.type = 'sysop'

      }

    } else {
      player = chatSession.users[uuid];
      socket.emit('log', chatSession.channels['#anouncements'].messages);
      socket.emit('message', 'System: Welcome back ' + player.nick + '!', '#anouncements');
      if (!player.disconnected) {
        player.tabs++;
        socket.disconnect();
      }
    }
    // Keep player connected if a refresh occurs before timeout
    if (player.disconnected) {
      clearTimeout(player.timeout);
      player.disconnected = false;
    }

    chatSession.users[uuid] = player;
    io.sockets.emit('addUser', player.nick);
  });



  socket.on('disconnect', (type) => {
    // Don't disconnect player in-game
    if (type == 'booted' && player.tabs > 0)
      return;

    player.disconnected = true;

    player.timeout = setTimeout(function() {
      if (player.disconnected) {
        delete chatSession.users[player.uuid];
        chatSession.count--;
      }
    }, 2000);

  io.sockets.emit('removeUser', player.nick);
  });


  socket.on('message', (msg: string, channel:string) => {

    if (!commands.isCommand(msg) && !player.quit) {
      var out = player.nick + ': ' + msg;
      io.emit('message', out, channel);

      // Add message to chatSession
      var curChannel = chatSession.channels[channel];
      if (curChannel)
        curChannel.messages.push(out);

      console.log(chatSession.channels[channel])
    } else if(commands.isCommand(msg)){
      commands.run(player, msg);
    }
    else{
      return
    }
  });

  socket.on('channelChange', (channel: string) => {

    player.currentChat = channel
    console.log(player.nick + ' moved to channe: '+player.currentChat)

  });

  // socket.on('create', (msg: string) => {
  //
  //   var msg = 'asd'
  //   io.sockets.emit('createTab', 'herp');
  //   socket.emit('createTab', 'merp');
  //   io.emit('createTab', 'serp');
  //   console.log(msg);
  // });

});


// Start App
var port = 8082;
http.listen(port);
console.log('Chat App Online @ localhost:' + port);
