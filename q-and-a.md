# 03-22-2016 Q & A Session

## How do I get rid of the dots next to an unordered list?

You can use the list style css attribute:

```css
ul {
  list-style: none;
}
```

For this starter code, I'm using reset.css to handle this. 

## How do we switch between tabs?

One possibility is to create a store that holds persistent data about the chat:

```javascript
var store = {
  '#anouncements': {
  type: 'sysop',
  messages: [
    'System: Alain joined the chat.'
   ]
   },
    '#soccer': {messages: []},
    '#jazz': {messages: []}
    ]
}

$('.tab').on('click', (e) => {
  if ($(this).attr("class") !== '.tab-primary') {
      // Clear Messages Board
      $('.messages').html("");
      var messages = store[$(this).attr("id")];

      // add all messages to the `.messages`
      messages.map((m) => {
        $('.messages').append(''); //@TODO - add messsage component
      });
  }
});
```

## How do you communicate with one user

You can create a specific channel in your persistent data (store), that has that user as a keyword.

## How do you delete channels?

You can make a function inside of the `chat-commands.ts` module, that handles deleting channels.

```javascript
"deletechannel": {
  numArgs: 1,
  handler: function(args :any[], io, session: IChatSession, player) {
  var channel = args[0];
  if (player.type === 'sysop')
    session
    io.sockets.emit('removechannel', channel);
  }
}
```

In the client, they would handle this by removing the channel from their store.

```javascript
socket.on('removechannel', (channel: string) => {
  //...
});
```

## How would you make a Bot?

You can use sockets, it sounds like a pain since you would make an event for every bot.

```javascript
io.sockets.emit('botmessage', msg)
```

for calculations:

```javascript
var x = eval('5*5*10+10/2*(1%2)');
console.log(x) //255
```
