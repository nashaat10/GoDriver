import redisClient from '../config/redis.js';

const simulateVehicleData = () => ({
    speed: Math.floor(Math.random() * 120),
    fuelLevel: Math.floor(Math.random() * 100),
    location: {
        latitude: (Math.random() * 180 - 90).toFixed(6),
        longitude: (Math.random() * 360 - 180).toFixed(6),
    },
});

const updateVehicleData = (vehicleId) => {
    const data = simulateVehicleData();
    redisClient.set(`vehicle:${vehicleId}`, JSON.stringify(data), 'EX', 60);
};

export const startVehicleSimulation = (vehicleId) => {
    setInterval(() => updateVehicleData(vehicleId), 5000);
};
