const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();
	const httpServer = createServer(server);
	const io = new Server(httpServer, {
		cors: "http://localhost:3000/"
	});

	// Object to keep track of users in each room
	const roomUsers = {};
	  
	io.on('connection', (socket) => {
		console.log(`New connection: ${socket.id}`);

		// Handle joining a room
		socket.on('joinRoom', ({ room_id, username }) => {
			socket.join(room_id);
			console.log(`${username} joined room ${room_id}`);

			// Initialize room in roomUsers if it doesn't exist
			if (!roomUsers[room_id]) {
				roomUsers[room_id] = [];
			}

			// Add user to the room's user list
			roomUsers[room_id].push({ socketId: socket.id, username });

			// Emit the updated user list to the room
			io.to(room_id).emit('userList', roomUsers[room_id].map(user => user.username));
		});

		// Handle leaving a room
		socket.on('leaveRoom', ({ room_id }) => {
			socket.leave(room_id);
			console.log(`Socket ${socket.id} left room ${room_id}`);

			if (roomUsers[room_id]) {
				// Remove the user from the room's user list
				roomUsers[room_id] = roomUsers[room_id].filter(user => user.socketId !== socket.id);

				// If no users are left in the room, delete the room entry
				if (roomUsers[room_id].length === 0) {
					delete roomUsers[room_id];
				} else {
					// Emit the updated user list to the room
					io.to(room_id).emit('userList', roomUsers[room_id].map(user => user.username));
				}
			}
		});

		// Handle disconnection
		socket.on('disconnect', () => {
			console.log(`${socket.id} has disconnected`);

			// Iterate through all rooms to remove the user
			for (const room_id in roomUsers) {
				const userIndex = roomUsers[room_id].findIndex(user => user.socketId === socket.id);
				if (userIndex !== -1) {
					const username = roomUsers[room_id][userIndex].username;
					roomUsers[room_id].splice(userIndex, 1);
					console.log(`${username} removed from room ${room_id}`);

					// Emit the updated user list to the room
					if (roomUsers[room_id].length > 0) {
						io.to(room_id).emit('userList', roomUsers[room_id].map(user => user.username));
					} else {
						delete roomUsers[room_id];
					}
					break; // Assuming a socket is only in one room
				}
			}
		});

		socket.on('addObject', (data) => {
			socket.broadcast.emit('addObject', data);  
		});

		socket.on('deleteObject', (data) => {
			socket.broadcast.emit('deleteObject', data); 
		});

		socket.on('updateObject', (data) => {
			socket.broadcast.emit('updateObject', data);
		});
	});

	server.all('*', (req, res) => {
		return handle(req, res);
	});

	httpServer.listen(3000, (err) => {
		if (err) throw err;
		console.log('> Ready on http://localhost:3000');
	});
});