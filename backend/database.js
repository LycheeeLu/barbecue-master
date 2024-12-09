const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const db = new sqlite3.Database(path.resolve(__dirname, 'iot_barbecue.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorData (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                temperature REAL NOT NULL,
                sensorLocation TEXT NOT NULL,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

//add sensor temperature and other data into database
const insertSensorData = (data) => {
    const { temperature, sensorLocation, timestamp } = data;
    return new Promise((resolve, reject) => {
        db.run(
            `
            INSERT INTO SensorData (temperature, sensorLocation, timestamp)
            VALUES (?, ?, ?)
            `,
            [temperature, sensorLocation, timestamp],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID });
            }
        );
    });
};

// Fetch sensor data from the database 
// Fetch all data because there is not so many types of data here, 
//but in the future there could be humidity sensor etc.
const fetchSensorData = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM SensorData ORDER BY timestamp DESC', [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

module.exports = { db, insertSensorData, fetchSensorData };
