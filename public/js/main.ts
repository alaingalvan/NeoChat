var nickname = 'guest',
  socket = io('http://localhost:8082'),
  uuid = localStorage.getItem('uuid'),
  store = {
    users: new Array(),
    count: 0,
    channels: {}
  };

// Function to append messages to the board
var appendMessage = (msg: string, channel: string) => {
  if ($('.tab-primary').html() === channel) {
    $('.messages').append(`
    <div class="message">
      <div style="background-image:url(http://lorempixel.com/g/128/128/cats/${Math.floor(10 * Math.random()) + 1})" class="message-icon"></div>
      <div class="message-content">
        <p>${msg}</p>
      </div>
    </div>`);
  }

  // Sync our local store with the message.
  if (store.channels[channel])
    store.channels[channel].messages.push(msg);
};

// Initialize
// @TODO - Change so register only happens when you finish the pick username form.
$(() => {
  socket.on('connect', () => {
    if (!uuid) {
      var randomid = Math.random().toString(36).substring(3, 16) + +new Date;
      localStorage.setItem('uuid', randomid);
      uuid = randomid;
    }
    socket.emit('register', uuid);
  });
});

socket.on('sync-store', (s) => {
  store = JSON.parse(s);

  //@TODO - Sync Tabs in HTML with jQuery
  //if $('.tab-primary').html()
});

// On Recieve Message
socket.on('message', appendMessage);

// On Nickname
socket.on('nickname', (msg) => {
  $('.messages').append(`
  <div class="message">
    <div style="background-image:url(http://lorempixel.com/g/128/128/cats/${Math.floor(10 * Math.random()) + 1})" class="message-icon"></div>
    <div class="message-content">
      <p>System: Changed Nickname to: ${msg}</p>
    </div>
  </div>`);
});

// On Clear
socket.on('clear', () => {
  $('.messages').html("");
});

socket.on('delete-tab', (t) => {
  // @TODO - Add logic for deleting tabs, use store.channels!
});

// Switching Tabs
$('.tab').click(function() {
  if (!$(this).hasClass('tab-primary')) {
    $('.tab').removeClass('tab-primary');
    $(this).addClass('tab-primary');
    // Clear .messages element and add new messages from channel
    $('.messages').html("");

    var channel = store.channels[$(this).html()];

    if(channel) {
      channel.messages.map((m) => {
        $('.messages').append(`
        <div class="message">
          <div style="background-image:url(http://lorempixel.com/g/128/128/cats/${Math.floor(10 * Math.random()) + 1})" class="message-icon"></div>
          <div class="message-content">
            <p>${m}</p>
          </div>
        </div>`);
      });
    }
  }
});

$('form').submit(() => {
  if (/\S/.test($('#message-input').val()))
    socket.emit('message', $('#message-input').val(), $('.tab-primary').html());
  $('#message-input').val('');
  return false;
});
