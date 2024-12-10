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

    data.forEach(item => {
        const timestamp = new Date(item.timestamp);
        const temperature = item.temperature;
        const location = item.sensorLocation;

        if (location === 'inside') {
            updateTemperatureDisplay('inside', temperature);
        } else if (location === 'outside') {
            updateTemperatureDisplay('outside', temperature);
        }

        console.log(`Timestamp: ${timestamp}, ${location === 'inside' ? 'Inside Temp' : 'Outside Temp'}: ${temperature}°C`);
    });
    updateChartsWithFetchedData(data);
    
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestOutsideData = data.find(item => item.sensorLocation === 'outside');
    const latestInsideData = data.find(item => item.sensorLocation === 'inside');
    updateTemperatureDisplay('outside', latestOutsideData.temperature);
    updateTemperatureDisplay('inside', latestInsideData.temperature);

};

const updateTemperatureDisplay = (location, temperature) => {
    const tempValue = temperature != null ? temperature.toFixed(1) : '--';
    document.getElementById(`${location}-temp`).textContent = `${tempValue}°C`;
    document.getElementById(`${location}-temp-box`).textContent = `${location.charAt(0).toUpperCase() + location.slice(1)} Temp: ${tempValue}°C`;
};

// Chart configuration for 24-hour monitoring
function createTemperatureChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: label,
          data: [],
          borderColor: color,
          backgroundColor: color + '33',
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
        },
        plugins: {
          legend: {
            display: false // Hide the legend
          }
        }
      }
    });
  }

// Initialize charts
const outsideChart = createTemperatureChart('outside-chart', 'Outside Meat','rgb(54, 162, 235)');
const insideChart = createTemperatureChart('inside-chart', 'Inside Meat','rgb(255, 99, 132)');

// Update charts with the data fetched from the API
const updateChartsWithFetchedData = (data) => {
    const currentTime = new Date();
    const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000);
    data.forEach(item => {
        const timestamp = new Date(item.timestamp);
        
        // Only add data points within the last 24 hours
        if (timestamp >= twentyFourHoursAgo) {
            if (item.sensorLocation === 'outside') {
                outsideChart.data.labels.push(timestamp);
                outsideChart.data.datasets[0].data.push(item.temperature);
            } else if (item.sensorLocation === 'inside') {
                insideChart.data.labels.push(timestamp);
                insideChart.data.datasets[0].data.push(item.temperature);
            }
        }
    });

    // Update chart after adding the data
    outsideChart.update();
    insideChart.update();
};


const WEBSOCKET_URL = 'ws://localhost:1866';
const socket = new WebSocket(WEBSOCKET_URL);

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);


    updateTemperatureDisplay('outside', data.outsideTemp);
    updateTemperatureDisplay('inside', data.insideTemp);
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