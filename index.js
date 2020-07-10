const path =  require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage =  require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} =  require('./utils/users');

const app = express();
const server =  http.createServer(app);
const io =  socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat App Bar';


io.on('connection', socket =>{
	
	socket.on('joinRoom', ({username,room})=>{
		
		const user = userJoin(socket.id, username, room);
		
		socket.join(user.room);
		
		//Welcome current user
		socket.emit('message', formatMessage(botName, 'Welcome to chat app'));
		
		//Brodcast when a user connects
		socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has join the Chat room`));
		
		//send active user and Room info
		io.to(user.room).emit('roomUsers',{
			room:user.room,
			users: getRoomUsers(user.room)
		})
	})
	
	
	
	
	//Listen for chatMessage
	socket.on('chatMessage', msg =>{
		const user = getCurrentUser(socket.id);
		
		io.to(user.room).emit('message', formatMessage(user.username, msg));
	})
	
	//Runs When client disconnect
	socket.on('disconnect', () =>{
		
		const user = userLeave(socket.id);
		
		if(user){
			io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat room`));
			
			//send active user and Room info
			io.to(user.room).emit('roomUsers',{
				room: user.room,
				users: getRoomUsers(user.room)
			})
		}
		
	})
})

const PORT = 3500 || process.env.PORT;

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));