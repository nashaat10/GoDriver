import amqp from "amqplib/callback_api.js";

import { getIO } from '../config/socket.js';

export const setupSocketHandlers = () => {
    const io = getIO();
    
    io.on('connection', socket => {
        console.log('Client connected');

        amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq', (err0, connection) =>  {
            if (err0) {
                console.error('Error connecting to RabbitMQ:', err0);
                return;
            }
            connection.createChannel((err1, channel) => {
                if (err1) {
                    console.error('Error creating channel:', err1);
                    return;
                }
                const alertQueue = 'alerts';
                channel.assertQueue(alertQueue);

                console.log("Consuming alert messages from the alert queue");
                
                channel.consume(alertQueue, (msg) => {
                    if (msg !== null) {
                        const alertData = JSON.parse(msg.content.toString());
                        console.log("Received Alert Data:", alertData);

                        // Emit to all connected clients
                        io.emit('alert', alertData);
                        
                        // Also emit to the alerts room for subscribers
                        io.to('alerts-room').emit('newAlert', {
                            alert: alertData,
                            timestamp: new Date(),
                            status: 'new'
                        });
                    }
                }, { noAck: true });
            });

            // Handle connection cleanup on socket disconnect
            socket.on('disconnect', () => {
                console.log('Client disconnected');
                if (connection) {
                    connection.close()
                        .then(() => console.log('RabbitMQ connection closed'))
                        .catch(err => console.error('Error closing RabbitMQ connection:', err));
                }
            });
        });

        // Handle room subscription
        socket.on('subscribeToAlerts', () => {
            socket.join('alerts-room');
            console.log(`Client ${socket.id} subscribed to alerts`);
        });

        socket.on('unsubscribeFromAlerts', () => {
            socket.leave('alerts-room');
            console.log(`Client ${socket.id} unsubscribed from alerts`);
        });
    });
};
