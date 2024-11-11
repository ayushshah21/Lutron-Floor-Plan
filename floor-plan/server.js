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
	  
	io.on('connection', (socket) => {
		socket.on('disconnect', () => {
			console.log(`${socket.id} has disconnected`);
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