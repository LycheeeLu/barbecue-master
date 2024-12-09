const express = require('express');
const bodyParser = require('body-parser');
const dataRoutes = require('./routes/dataRoutes'); // Import API routes
const path = require('path');
const app = express();
const PORT = 3000;

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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Time to be a Barbecue Master!`);
});
