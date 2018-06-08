const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
var _ = require('lodash');


//set the template engine ejs
app.set('view engine', 'ejs');

//middlewares
app.use(express.static('public'));

var room ='' ,usernames = {}, rooms = [], noOfUser= 0;

app.get('/', function(req, res){
  res.render('index')
  //console.log("req>>>>>>",req.query)
  room = req.query.id;
  //console.log("request-room",room);
});

function check_key(v)
{
  var val = '';

  for(var key in usernames)
    {
    if(usernames[key] == v)
    val = key;
  }
  return val;
}

io.on('connection', function(socket){
  //default username
    socket.on('join', function(room){
      if(room.id){
        noOfUser = Object.keys(usernames).length;
        socket.join(room.id);
      } else {
        usernames = {};
      }
    })

    socket.on('adduser', function(data){
      console.log(data.username + " " + "connected");
      socket.username = data.username;
      socket.room = room || socket.id;
      //console.log("room-----------",socket.room, "username", socket.username)
      usernames[data.username] = socket.id;
      if(!room)
        io.sockets["in"](socket.room).emit('updatechat', {username: 'you'  , message: '  created this room'});
      // echo to client they've connectedsocket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
      io.sockets["in"](socket.room).emit('updatechat', {username: data.username  , message: '  has connected to this room', color: true});
      socket.emit('updaterooms', rooms, socket.room);
      noOfUser = Object.keys(usernames).length;
      if(noOfUser >= 2 ) {
        socket.emit('chat_open');
      } else {
        socket.emit('link', {link : '192.168.1.181:3000', id: socket.id, username: data.username, room: socket.room})
      }
      // echo to client their username
      socket.emit('store_username', data.username);
    });

    socket.on('sendchat', function(data) {
      io.sockets["in"](socket.room).emit('new_message', {username: socket.username, message: data.message, id: socket.id});
    });

    socket.on('disconnect', function() {
      delete usernames[socket.username];
      io.sockets.emit('updateusers', usernames);
      io.sockets["in"](socket.room).emit('updatechat', {username: socket.username, message: '  has disconnected', color: false} );
      socket.leave(socket.room);
      console.log(socket.username + " " + "disconnected");
    });

    // when the user sends a private msg to a user id, first find the username
    socket.on('check_user', function(asker, id){
      io.sockets.socket(usernames[asker]).emit('msg_user_found', check_key(id));
    });

    //listen on typing
    socket.on('typing', (data) => {
      socket.broadcast['in'](socket.room).emit('typing', {username : socket.username})
    })
});

http.listen(3000, '192.168.1.181');