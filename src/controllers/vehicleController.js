import redisClient from '../config/redis.js';

export const getVehicleData = (req, res) => {
    const { id } = req.params;

    redisClient.get(`vehicle:${id}`, (err, data) => {
        if (err) return res.status(500).json({ error: 'Redis error' });
        if (data) {
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Vehicle not found' });
        }
    });
};
