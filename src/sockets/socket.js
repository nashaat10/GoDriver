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
                const vehicleDataQueue = 'vehicle_data'; // Ensure this queue is defined

                channel.assertQueue(alertQueue);
                channel.assertQueue(vehicleDataQueue); // Assert vehicle data queue

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

                console.log("Consuming vehicle data messages from the vehicle data queue");
                channel.consume(vehicleDataQueue, (msg) => {
                    if (msg !== null) {
                        const vehicleData = JSON.parse(msg.content.toString());
                        console.log("Received Vehicle Data:", vehicleData);

                        // Emit vehicle data to all connected clients
                        io.emit('vehicleData', vehicleData);
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
}