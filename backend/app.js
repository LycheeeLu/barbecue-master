const express = require('express');
const bodyParser = require('body-parser');
const dataRoutes = require('./routes/dataRoutes'); // Import API routes

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/data', dataRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Time to be a Barbecue Master!`);
});
