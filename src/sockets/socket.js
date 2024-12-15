import { Server } from 'socket.io';
import http from 'http';
import app from './app.js';

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Configure according to your needs
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
