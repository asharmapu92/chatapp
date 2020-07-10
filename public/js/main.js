const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomNsme = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room form url
const {username, room} = Qs.parse(location.search,{
	ignoreQueryPrefix: true
});

const socket =  io();

socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({room, users})=>{
	outputRoomName(room);
	outputUsers(users);
})

//Message from Sever
socket.on('message', message =>{
	outputMessage(message);
	
	//Scroll Down
	chatMessage.scrollTop = chatMessage.scrollHeight;
})

//Message submit
chatForm.addEventListener('submit', e=>{
	e.preventDefault();
	
	//Get message as text
	const msg = e.target.elements.msg.value;
	
	//emit message to server
	socket.emit('chatMessage', msg);
	
	//Clear input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
	
})

//Output Message to Dom
function outputMessage(message){
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p><p class="text">${message.text}</p>`;
	chatMessage. appendChild(div);
	
}

//add Room name to Dom
function outputRoomName(){
	roomNsme.innerText = room;
}

//Add Users to DOM
function outputUsers(users){
	console.log(users);
	userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}