const express = require('express');
const router = express.Router();
const { insertSensorData, fetchSensorData } = require('../database');

//using POST to receive sensor data
router.post('/', async (req, res) => {
    const { temperature, sensorLocation, timestamp } = req.body;

//if wanted, can also implement data validation here
        const result = await insertSensorData({ temperature, sensorLocation, timestamp });
        res.status(201).json({ message: 'Data received and stored successfully!', id: result.id });

});

// GET /api/data to fetch sensor data
router.get('/', async (req, res) => {
    try {
        const data = await fetchSensorData();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = router;
