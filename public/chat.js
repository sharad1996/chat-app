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

  send_message.submit(function(e){
    e.preventDefault();
    socket.emit('sendchat', {message : message.val()})
  })

  //Listen on new_message
  socket.on("new_message", (data) => {
    feedback.html('');
    if(socket.id === data.id) {
      message.val('');
    }
    var msg = socket.id === data.id ? $("<div id='scroll-div' class='message-box-holder'><div id='scroll-message' class='message-box'>" + data.message + "</div></div>") : $("<div id='scroll-div' class='message-box-holder'><div class='message-sender' onclick='send_individual_msg(data.id)' >" + data.username + "</div><div id='scroll-message' class='message-box message-partner'>" + data.message + "</div></div>");
    chatroom.append(msg);
    var objDiv = document.getElementById("chatroom");
    objDiv.scrollTop = objDiv.scrollHeight;
  })

  socket.on("updatechat", (data) => {
    feedback.html('');
    //var msg = socket.id === data.id ? $("<div class='message-box-holder'><div class='message-box'>" + data.message + "</div></p></div>") : $("<div class='message-box-holder'><div class='message-sender' onclick='send_individual_msg(data.id)' >" + data.username + "</div><div class='message-box message-partner'>" + data.message + "</div></p></div>");
    chatroom.append("<div class='update-box-holder'><div class='update-box'>" + data.username + data.message + "</div></div>")
    //var msg = socket.id === data.id ? $("<div class='message-box-holder'><div class='message-box'>" + data.message + "</div></p></div>") : $("<div class='message-box-holder'><div class='message-sender' onclick='send_individual_msg(data.id)' >" + data.username + "</div><div class='message-box message-partner'>" + data.message + "</div></p></div>");
  })

  socket.on("link", (data) => {
    link.show()
    feedback.html('');
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
  send_username.submit(function(e){
    e.preventDefault();
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

  socket.on('newImg', function(user, img) {
    displayImage(user, img);
  });


  document.getElementById('sendImage').addEventListener('change', function() {
    if (this.files.length != 0) {
      var file = this.files[0],
        reader = new FileReader();
      reader.onload = function(e) {
        this.value = '';
        socket.emit('img', e.target.result);
      };
      reader.readAsDataURL(file);
    };
  }, false);

  function displayImage(user, imgData) {
    var container = document.getElementById('chatroom'),
      msgToDisplay = document.createElement('p'),
      date = new Date().toTimeString().substr(0, 8);
    msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
    container.appendChild(msgToDisplay);
    container.scrollTop = container.scrollHeight;
  }

});
