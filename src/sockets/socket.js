import amqp from "amqplib/callback_api.js";
import { Server } from "socket.io";
import http from "http";
import app from "../../app.js";

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {
    console.log('Client connected');

    amqp.connect('amqp://localhost', (err0, connection) => {
        if (err0) {
            throw err0;
        }
        connection.createChannel((err1, channel) => {
            if (err1) {
                throw err1;
            }
            const alertQueue = 'alerts';
            channel.assertQueue(alertQueue);


            console.log("Consuming alert messages from the alert queue");
            // Consume alert messages from the alert queue
            channel.consume(alertQueue, (msg) => {
                if (msg !== null) {
                    const alertData = JSON.parse(msg.content.toString());
                    console.log("Received Alert Data:", alertData);

                    // Emit the alert through sockets
                    io.emit('alert', alertData);
                }
            }, { noAck: true });
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4000, () => {
    console.log('Socket server listening on port 4000');
});