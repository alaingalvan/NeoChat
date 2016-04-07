var nickname = 'guest', socket = io('http://localhost:8082'), uuid = localStorage.getItem('uuid'), store = {
    users: new Array(),
    count: 0,
    channels: {}
};
var appendMessage = function (msg, channel) {
    if ($('.tab-primary').html() === channel) {
        $('.messages').append("\n    <div class=\"message\">\n      <div style=\"background-image:url(http://lorempixel.com/g/128/128/cats/" + (Math.floor(10 * Math.random()) + 1) + ")\" class=\"message-icon\"></div>\n      <div class=\"message-content\">\n        <p>" + msg + "</p>\n      </div>\n    </div>");
    }
    if (store.channels[channel])
        store.channels[channel].messages.push(msg);
};
var appendTabs = function (msg) {
    $('.tabs').append("\n        <li class=\"tab\">" + msg + "</li>\n    ");
};
$(function () {
    socket.on('connect', function () {
        if (!uuid) {
            var randomid = Math.random().toString(36).substring(3, 16) + +new Date;
            localStorage.setItem('uuid', randomid);
            uuid = randomid;
        }
        socket.emit('register', uuid);
        socket.emit('channelChange', $('.tab-primary').html());
    });
});
socket.on('sync-store', function (s) {
    store = JSON.parse(s);
});
socket.on('message', appendMessage);
socket.on('nickname', function (msg) {
    $('.messages').append("\n  <div class=\"message\">\n    <div style=\"background-image:url(http://lorempixel.com/g/128/128/cats/" + (Math.floor(10 * Math.random()) + 1) + ")\" class=\"message-icon\"></div>\n    <div class=\"message-content\">\n      <p>System: Changed Nickname to: " + msg + "</p>\n    </div>\n  </div>");
});
socket.on('clear', function () {
    $('.messages').html("");
});
socket.on('leave', function () {
    $('.tab').removeClass('tab-primary');
    $("li:contains(#announcements)").addClass('tab-primary');
});
socket.on('join', function (t) {
    $('.tab').removeClass('tab-primary');
    console.log(t);
    $("li:contains(" + t + ")").addClass('tab-primary');
});
socket.on('addUser', function (u) {
    $('.users').append("<li class=\"user\">" + u + "</li>");
});
socket.on('removeUser', function (u) {
    $("li:contains(" + u + ")").remove();
});
socket.on('admin', function () {
    $('.tabs').append("\n      <li class=\"tab\">#admin</li>\n  ");
});
socket.on('createTab', appendTabs);
socket.on('delete-tab', function (t) {
    console.log(t);
    $('.tab').remove(":contains(" + t + ")");
});
$('#allTabs').on('click', '.tab', function () {
    if (!$(this).hasClass('tab-primary')) {
        $('.tab').removeClass('tab-primary');
        $(this).addClass('tab-primary');
        $('.messages').html("");
        var channel = store.channels[$(this).html()];
        socket.emit('channelChange', $('.tab-primary').html());
        if (channel) {
            channel.messages.map(function (m) {
                $('.messages').append("\n        <div class=\"message\">\n          <div style=\"background-image:url(http://lorempixel.com/g/128/128/cats/" + (Math.floor(10 * Math.random()) + 1) + ")\" class=\"message-icon\"></div>\n          <div class=\"message-content\">\n            <p>" + m + "</p>\n          </div>\n        </div>");
            });
        }
    }
});
$('form').submit(function () {
    if (/\S/.test($('#message-input').val()))
        socket.emit('message', $('#message-input').val(), $('.tab-primary').html());
    $('#message-input').val('');
    return false;
});
//# sourceMappingURL=main.js.map