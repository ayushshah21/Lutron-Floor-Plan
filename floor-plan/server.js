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
		cors: {
		  origin: '*',  // Allow all origins for testing purposes
		  methods: ['GET', 'POST']
		}
	});
	  
	io.on('connection', (socket) => {
		console.log(`Client connected: ${socket.id}`);

		// Emit a basic test event
  		socket.emit('test', 'Hello from the server!');

		// Listen for 'drawing' event from clients
		socket.on('drawing', (data) => {
			// Broadcast drawing data to all other clients
			console.log('Received drawing data:', data);
			socket.broadcast.emit('drawing', data);
		});

		socket.on('disconnect', () => {
			console.log(`${socket.id} has disconnected`);
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
