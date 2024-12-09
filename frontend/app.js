// Fetch the sensor data from the backend API
//where the raw ugly data is 
const fetchSensorData = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();
        
        // Process and display the data
        displaySensorData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const displaySensorData = (data) => {
    // Example: Displaying the fetched sensor data on the page (can be updated as needed)
    console.log('Fetched Sensor Data:', data);
};



// Chart configuration for 24-hour monitoring
function createTemperatureChart(canvasId, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

// Initialize charts
const outsideChart = createTemperatureChart('outside-chart', 'Outside Meat');
const insideChart = createTemperatureChart('inside-chart', 'Inside Meat');

// Update charts with the data fetched from the API
const updateChartsWithFetchedData = (data) => {
    data.forEach(item => {
        const timestamp = new Date(item.timestamp).getTime();
        
        // Update outside chart
        outsideChart.data.labels.push(timestamp);
        outsideChart.data.datasets[0].data.push(item.temperature); // Adjust field name as needed
        
        // Update inside chart
        insideChart.data.labels.push(timestamp);
        insideChart.data.datasets[0].data.push(item.temperature); // Adjust field name as needed
    });

    // Update chart after adding the data
    outsideChart.update();
    insideChart.update();
};


// WebSocket Connection to Port 1866
const WEBSOCKET_URL = 'ws://localhost:1866';
const socket = new WebSocket(WEBSOCKET_URL);

socket.onopen = () => {
    console.log('WebSocket connection established');
};


socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Update current temperature displays
    document.getElementById('outside-temp').textContent = `${data.outsideTemp}°C`;
    document.getElementById('inside-temp').textContent = `${data.insideTemp}°C`;
    
    // Update charts
    const currentTime = new Date();
    const currentHour = currentTime.setMinutes(0, 0, 0); // Set to the start of the current hour

    // Keep only the last 24 hours of data
    const twentyFourHoursAgo = new Date(currentHour - 24 * 60 * 60 * 1000);
    
    // Update outside chart data
    if (!outsideChart.data.labels.includes(currentHour)) {
        outsideChart.data.labels.push(currentHour);
        outsideChart.data.datasets[0].data.push(data.outsideTemp);
    }

    // Update inside chart data
    if (!insideChart.data.labels.includes(currentHour)) {
        insideChart.data.labels.push(currentHour);
        insideChart.data.datasets[0].data.push(data.insideTemp);
    }

    // Filter out data older than 24 hours
    outsideChart.data.labels = outsideChart.data.labels.filter(time => time >= twentyFourHoursAgo);
    outsideChart.data.datasets[0].data = outsideChart.data.datasets[0].data.slice(
        outsideChart.data.labels.length
    );

    insideChart.data.labels = insideChart.data.labels.filter(time => time >= twentyFourHoursAgo);
    insideChart.data.datasets[0].data = insideChart.data.datasets[0].data.slice(
        insideChart.data.labels.length
    );

    // Update chart
    outsideChart.update();
    insideChart.update();
};

socket.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};

// Call the fetch function to load initial data when the page loads
fetchSensorData();