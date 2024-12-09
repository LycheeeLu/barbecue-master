const express = require('express');
const bodyParser = require('body-parser');
const dataRoutes = require('./routes/dataRoutes'); // Import API routes

const path = require('path');
const PORT = 3000;
const WebSocket = require('ws');
const http = require('http');
const { fetchSensorData } = require('./database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware for servin static files like index.html
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (including CSS, JS) from the frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });
// Routes
app.use('/api/data', dataRoutes);


// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('WebSocket client connected.');

    ws.on('close', () => {
        console.log('WebSocket client disconnected.');
    });
});

// Broadcast function to send updates to all WebSocket clients
function broadcastUpdate(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API to handle sensor data
//fontend retrieves temperature and sensor location data from the SQLite database.
app.get('/api/data', async (req, res) => {
    try {
        // Use the fetchSensorData function to get data from the database
        const data = await fetchSensorData();
        
        // Send the data as a JSON response to the frontend
        res.status(200).json(data);
    } catch (err) {
        // Handle any errors
        console.error('Error retrieving data:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Time to be a Barbecue Master!`);
});
