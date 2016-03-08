var nickname = 'guest';
var socket = io('http://localhost:8083');

$(function() {
  socket.on('connect', function() {
    // If uuid doesn't exist
    if (!(uuid = localStorage.getItem('uuid'))) {
      var randomlyGeneratedUID = Math.random().toString(36).substring(3, 16) + +new Date;
      // Generate A uuid and store it locally
      localStorage.setItem('uuid', randomlyGeneratedUID);
    }
    //Send our uuid to the 'register'.
    socket.emit('register', uuid);
  });

});

// Emit a 'message' to the server.
$('form').submit(function() {
  if (/\S/.test($('#m').val())) // If it's not whitespace
    socket.emit('message', $('#m').val());
  $('#m').val(''); //Reset the input
  return false;
});

// receive 'message' from server
socket.on('message', function(msg) {
  $('#messages').append($('<li>').text(msg));
});
socket.on('nickname', function(msg) {
  nickname = msg;
  $('#messages').append($('<li>').text(msg + ' just joined!'));
});
socket.on('clear', function() {
  $('#messages').html("");
});

/*Warren */
jQuery(document).ready(function() {
    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');

        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();

        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });
});
