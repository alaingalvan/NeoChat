# NeoChat

[![License](http://img.shields.io/:license-mit-blue.svg)](http://mit-license.org)

A chat app built with TypeScript, [Sockets.io](http://socket.io/), [Express](expressjs.com), and [jQuery](https://jquery.com/). Theme prototyped with [Codepen](http://codepen.io/alaingalvan/pen/PNWqQv).

## Installation

On your command line interface, just enter:

```bash
# Install our global dependencies
npm install typings --global    # Handles Type Definitions for autocomplete
npm install typescript --global # If you don't already have it.

# Install everything for your project.
npm install
typings install
```

This will install your node modules.

## Architecture

```bash
|- public/            # All HTML/CSS/Frontend code is here
  |- css/
  |- js/
    |- main.ts        # Handles Socket.io Events
  |- index.html
|- server.ts          # Bootstraps Application
|- chat-session.ts    # Holds the chat session store
|- chat-commands.ts   # Handles any /command sent by users.
```

This application builds on 3 design patterns, [**Observer Model**](https://sourcemaking.com/design_patterns/observer) for listening for events from the server, [**State Model**](https://sourcemaking.com/design_patterns/state) in the [*singleton*](https://sourcemaking.com/design_patterns/singleton) store of the application's whole state in `chat-session.ts`, and [**Proxy Model**](https://sourcemaking.com/design_patterns/proxy) Pattern in our interactions between the server and client, in particular in the way we process chat commands with `chat-commands.ts`.

We're using stores and states, similar to React and Redux, to make this happen.

### Interface Structure

Our Chat Session is an object made of an array of users, the number of users in the server, and a map of the channels the server has. Each user has a unique user id (*uuid*), a nickname, a socket, the type of user he is (SysOp denoted by a star next to his name, Moderator denoted by a cross (+) next to his name, and a User), the tabs on the browser he has open.  

Each channel has a type (SysOp, Moderator, or User) and a messages array.

```javascript
interface IChatSession {
  users: IUser[],
  count: number,
  channels: { [channel: string]: IChannel }
}

interface IPlayer {
  uuid: string,
  tabs: number,
  nick: string,
  socket: any,
  type: string
};


interface IChannel {
  type: string,
  messages: string[];
}
```

> When a user joins the chat, they must provide a username before being accepted into the chat, so *change the front end `main.js` file to check if the form as been filled, then send a request to `register`*.

On joining the chat, the user gets a copy of the chat. Ideally you would [sanitize](https://en.wikipedia.org/wiki/Sanitization_(classified_information)) this copy and only let the user receive what their security status allows.

```javascript
// On the Server
var sendStore = (user) => {
  var sessionCopy = JSON.stringify(chatSession);

  // do something with copy to make sure it's secure
  // ...

  user.socket.emit('sync-store', sessionCopy); //You can only transfer json strings to the frontend, not objects!
}
```

From there the client would be able to store the session:

```javascript
// On the Client
socket.on('sync-store', (s) => {
  store = s;
});
```

Thus to switch tabs on the client, all you would have to do is get the array of messages stored in their local store.

```javascript
$('.tab').click(function () {
  if (!$(this).hasClass('tab-primary')) {
    $('.tab').removeClass('tab-primary');
    $(this).addClass('tab-primary');

    // Clear .messages element and add new messages from channel
    $('.messsages').html('');

    var channel = store[$(this).html()];
    channel.map((m) => {
          appendMessage(m);
    });
  }
});
```

### State Updating

The client must update the store whenever it receives a message from the server.

### Flow of Events

When you compile your program and start it with:

```bash
node server.js
```

#### Initialization

We initialize all our dependencies, [express](expressjs.com), [http](https://nodejs.org/api/http.html), [socket.io](http://socket.io), chat-session, and chat-commands.

```javascript
import * as Express from 'express';
import * as Http from 'http';
import * as Sockets from 'socket.io';

import chatSession from './chat-session';
import Commands from './chat-commands';

var app = Express();
var http = Http.createServer(app);
var io = Sockets(http);

//Bind Chat Commands Map to Socket Session
var commands = Commands(io, chatSession);
```

#### Socket Event Declarations

after initializing things, we listen for 3 events, `register`, `disconnect`, and `message`.

```javascript
io.on('connection', (socket) => {

  var player;

  socket.on('register', (uuid: string) => {
    // Add the new user to the chatSession
  });



  socket.on('disconnect', (type) => {
    // Remove the user from the chatSession
  });


  socket.on('message', (msg: string, who?: any) => {
    // Broadcast message
  });
});
```

On every event

#### Client Event Declarations

The Client then initializes it's event listeners and listens for those 3 events we described.

```javascript
var nickname = 'guest',
  socket = io('http://localhost:8082'),
  uuid;

$(() => {
  // Create Unique id and send it to the server
  socket.on('connect', () => {
    // ...
    socket.emit('register', uuid);
  });
});

// Send a message if the input field isn't empty.
$('form').submit(() => {
  //...
  socket.emit('message', $('#m').val());
});

// Listen for a message
socket.on('message', (msg) => {
  $('#messages').append($('<li>').text(msg));
});

// Listen for a nickname
socket.on('nickname', (msg) => {
  nickname = msg;
  $('#messages').append($('<li>').text(msg + ' just joined!'));
});

// Listen for a clear
socket.on('clear', () => {
  $('#messages').html("");
});

```
