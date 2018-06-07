$(function(){
    //make connection
  var socket = io.connect('http://192.168.1.181:3000')

  //buttons and inputs
  var message = $("#message")
  var username = $("#username")
  var room = $("#room")
  var chatbox = $('#chatbox')
  var send_message = $("#send_message")
  var send_username = $("#send_username")
  var add = $("#add_username")
  var chatroom = $("#chatroom")
  var feedback = $("#feedback")
  var link = $("#link")
  var urlParams = new URLSearchParams(window.location.search)
  var configId = urlParams.get('id');

  chatbox.hide()
  link.hide()

  function send_individual_msg(id)
  {
    socket.emit('check_user', my_username, id);
  }

  socket.on('connect', function(){
    socket.emit('join', {id : configId})
  })

  send_message.click(function(){
    socket.emit('sendchat', {message : message.val()})
  })

  //Listen on new_message
  socket.on("new_message", (data) => {
    feedback.html('');
    message.val('');
    var msg = socket.id === data.id ? $("<div class='message-box-holder'><div class='message-box'>" + data.message + "</div></p></div>") : $("<div class='message-box-holder'><div class='message-sender' onclick='send_individual_msg(data.id)' >" + data.username + "</div><div class='message-box message-partner'>" + data.message + "</div></p></div>");
    chatroom.append(msg)
  })

  socket.on("updatechat", (data) => {
    feedback.html('');
    message.val('');
    //var msg = socket.id === data.id ? $("<div class='message-box-holder'><div class='message-box'>" + data.message + "</div></p></div>") : $("<div class='message-box-holder'><div class='message-sender' onclick='send_individual_msg(data.id)' >" + data.username + "</div><div class='message-box message-partner'>" + data.message + "</div></p></div>");
    chatroom.append("<div class='update-box-holder'><div class='update-box'>" + data.username + data.message + "</div></p></div>")
  })

  socket.on("link", (data) => {
    link.show()
    feedback.html('');
    message.val('');
    var url = $('<strong />').append($("<p />").addClass("message").append($("<a >").attr({href: ("?id=" + data.id), target: '_blank'}).text('room url')  ));
    link.append(url)
  })

  socket.on('chat_open', function(usernames) {
    link.hide()
    add.hide()
    chatbox.show()
  });

  socket.on('updaterooms', function (rooms, current_room) {
    $.each(rooms, function(key, value) {
      if(value == current_room){
        $('#rooms').append('<div>' + value + '</div>');
      }
    });
  });

  //Emit a username
  send_username.click(function(){
    socket.emit('adduser', {username: username.val()})
  })
  //Emit typing
  message.bind("keypress", () => {
    socket.emit('typing')
  })

  //Listen on typing
  socket.on('typing', (data) => {
    feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
  })

  socket.on('store_username', function (username) {
    my_username = username;
  });

});
