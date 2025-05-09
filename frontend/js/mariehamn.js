// Weather data object with initial values (will be replaced with API data)
const weatherData = {
    hourly: [
        { time: "Now", temp: 19, hum: 68, pressure: 1013 },
        { time: "9 AM", temp: 18, hum: 70, pressure: 1012 },
        { time: "8 AM", temp: 17, hum: 72, pressure: 1012 },
        { time: "7 AM", temp: 16, hum: 75, pressure: 1011 },
        { time: "6 AM", temp: 15, hum: 78, pressure: 1010 },
        { time: "5 AM", temp: 14, hum: 80, pressure: 1010 }
    ]
};

// Chart data object
let marienhamnWeatherData = {
    temperature: {
        label: 'Temperature (°C)',
        values: [19, 18, 17, 16, 15, 14],
        color: '#ff6384'
    },
    humidity: {
        label: 'Humidity (%)',
        values: [68, 70, 72, 75, 78, 80],
        color: '#36a2eb'
    },
    pressure: {
        label: 'Pressure (hPa)',
        values: [1013, 1012, 1012, 1011, 1010, 1010],
        color: '#4bc0c0'
    }
};

// Global variables
let currentChart = null;
let graphVisible = false;
let forecastList;
let currentTemp;
const labels = ['Now', '9 AM', '8 AM', '7 AM', '6 AM', '5 AM'];

// Global function for updating current weather
function updateCurrentWeather(data) {
    if (!currentTemp) {
        currentTemp = document.querySelector('.temp-display');
    }
    
    if (currentTemp) {
        currentTemp.textContent = `${data.temp}°C`;
    }
}

// Global function for rendering forecast
function renderForecast() {
    if (!forecastList) {
        forecastList = document.querySelector('.forecast-list');
    }
    
    if (!forecastList) return;
    
    const data = weatherData.hourly;
    forecastList.innerHTML = data.map((item, index) => `
        <div class="forecast-item ${index === 0 ? 'current' : ''}" 
             onclick="updateCurrentWeather(${JSON.stringify(item)})">
            <span class="time">${item.time}</span>
            <div class="metric">
                <i class="fas fa-temperature-high metric-icon"></i>
                <span class="temp">${item.temp}°C</span>
            </div>
            <div class="metric">
                <i class="fas fa-tint metric-icon"></i>
                <span class="detail-value">${item.hum}%</span>
            </div>
            <div class="metric">
                <i class="fas fa-compress-alt metric-icon"></i>
                <span class="detail-value">${item.pressure} hPa</span>
            </div>
        </div>
    `).join('');

    updateCurrentWeather(data[0]);
}

// Function to update the chart with the selected data type
function updateChart(type) {
    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(document.getElementById('weatherChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: marienhamnWeatherData[type].label,
                data: marienhamnWeatherData[type].values,
                borderColor: marienhamnWeatherData[type].color,
                backgroundColor: marienhamnWeatherData[type].color + '33', // Add transparency
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// Function to fetch data from the API
async function fetchWeatherData() {
    try {
        // Try to fetch from the API
        const response = await fetch('http://192.168.108.13:8081/mariehamn', {
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        
        const data = await response.json();
        processApiData(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        console.log('Using dummy data instead');
        
        // Use dummy data if API fetch fails
        const dummyData = generateDummyData();
        processApiData(dummyData);
    }
}

// Generate realistic dummy data for testing
function generateDummyData() {
    const now = new Date();
    const data = [];
    
    // Generate data points for the current hour and previous hours
    for (let i = 0; i < 24; i++) {
        // Create a date for each hour
        const time = new Date(now);
        time.setHours(now.getHours() - i);
        time.setMinutes(0); // Set to the start of the hour
        
        // Add a data point for each hour
        data.push({
            time: time.toISOString(),
            temp: 20 - (i * 0.5) + (Math.random() * 2 - 1), // Temperature decreases as we go back in time
            hum: 65 + (Math.random() * 20 - 10), // Humidity between 55-85%
            pressure: 1010 + (Math.random() * 10 - 5) // Pressure between 1005-1015 hPa
        });
    }
    
    return data;
}

// Process the API data and update our data objects
function processApiData(apiData) {
    if (!apiData || apiData.length === 0) {
        renderForecast();
        return;
    }
    
    // Get the current time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Create hourly historical data from API data
    const processedHourlyData = [];
    
    // Get the most recent data point for "Now"
    const latest = apiData[0];
    processedHourlyData.push({
        time: "Now",
        temp: Math.round(latest.temp),
        hum: Math.round(latest.hum),
        pressure: Math.round(latest.pressure)
    });
    
    // Create data points for previous hours (9:00, 8:00, etc.)
    for (let i = 1; i <= 5; i++) {
        // Calculate the target hour
        const targetHour = currentHour - i;
        const displayHour = targetHour < 0 ? targetHour + 24 : targetHour; // Handle midnight crossing
        
        // Format the hour for display
        const ampm = displayHour >= 12 ? 'PM' : 'AM';
        const hour12 = displayHour % 12 || 12; // Convert to 12-hour format
        const timeLabel = `${hour12} ${ampm}`;
        
        // Find the closest data point to this hour
        let closestDataPoint = null;
        let smallestTimeDiff = Infinity;
        
        for (const dataPoint of apiData) {
            const dataTime = new Date(dataPoint.time);
            const dataHour = dataTime.getHours();
            
            // Check if this data point is from the target hour
            if (dataHour === displayHour) {
                // Calculate how close this data point is to the exact hour
                const minutes = dataTime.getMinutes();
                const timeDiff = Math.abs(minutes);
                
                if (timeDiff < smallestTimeDiff) {
                    smallestTimeDiff = timeDiff;
                    closestDataPoint = dataPoint;
                }
            }
        }
        
        // If we found a data point for this hour, use it
        if (closestDataPoint) {
            processedHourlyData.push({
                time: timeLabel,
                temp: Math.round(closestDataPoint.temp),
                hum: Math.round(closestDataPoint.hum),
                pressure: Math.round(closestDataPoint.pressure)
            });
        } else {
            // If no data point found for this hour, use the previous hour's data or estimate
            const prevHourData = processedHourlyData[processedHourlyData.length - 1];
            processedHourlyData.push({
                time: timeLabel,
                temp: prevHourData.temp - 1, // Slight decrease for missing data
                hum: prevHourData.hum,
                pressure: prevHourData.pressure
            });
        }
    }
    
    // Update the hourly data
    weatherData.hourly = processedHourlyData;
    
    // Update the chart data
    // Extract times for labels from the hourly data
    const newLabels = processedHourlyData.map(item => item.time);
    
    // Update the labels array
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));
    
    // Update the chart data
    marienhamnWeatherData.temperature.values = processedHourlyData.map(item => item.temp);
    marienhamnWeatherData.humidity.values = processedHourlyData.map(item => item.hum);
    marienhamnWeatherData.pressure.values = processedHourlyData.map(item => item.pressure);
    
    // Update the current chart if it exists and is visible
    if (currentChart && graphVisible) {
        const activeButton = document.querySelector('.graph-button.active');
        if (activeButton) {
            updateChart(activeButton.dataset.type);
        } else {
            updateChart('temperature');
        }
    }
    
    // Also update the current weather display
    updateCurrentWeatherDisplay(latest);
    
    // Render the forecast
    renderForecast();
}

// Update the current weather display with the latest data
function updateCurrentWeatherDisplay(latestData) {
    if (!latestData) return;
    
    const tempDisplay = document.querySelector('.temp-display');
    
    if (tempDisplay) {
        tempDisplay.textContent = `${Math.round(latestData.temp)}°C`;
    }
}

// Function to toggle graph visibility
function toggleGraph() {
    const graphContainer = document.getElementById('graph-container');
    const graphButtons = document.getElementById('graph-buttons');
    const showGraphBtn = document.getElementById('show-graph-btn');
    
    graphVisible = !graphVisible;
    
    if (graphVisible) {
        // Show graph and buttons
        graphContainer.style.display = 'block';
        graphButtons.style.display = 'flex';
        
        // Change button text to "Hide Graph"
        showGraphBtn.innerHTML = '<i class="fas fa-chart-line"></i><span>Hide Graph</span>';
        
        // Initialize the chart with the active type
        const activeType = document.querySelector('.graph-button.active')?.dataset.type || 'temperature';
        updateChart(activeType);
        
        // Scroll to graph
        graphContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Hide graph and buttons
        graphContainer.style.display = 'none';
        graphButtons.style.display = 'none';
        
        // Change button text back to "Show Graph"
        showGraphBtn.innerHTML = '<i class="fas fa-chart-line"></i><span>Show Graph</span>';
        
        // Destroy chart to free up resources
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM element references
    forecastList = document.querySelector('.forecast-list');
    currentTemp = document.querySelector('.temp-display');
    
    // Set default dates (today and a week ago for historical data)
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    document.getElementById('start-date').valueAsDate = lastWeek;
    document.getElementById('end-date').valueAsDate = today;
    
    // Graph type buttons
    const graphButtons = document.querySelectorAll('.graph-button');
    graphButtons.forEach(button => {
        button.addEventListener('click', () => {
            graphButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            if (graphVisible) {
                updateChart(button.dataset.type);
            }
        });
    });
    
    // Show/Hide graph button
    document.getElementById('show-graph-btn').addEventListener('click', toggleGraph);
    
    // Initial fetch and render
    fetchWeatherData();
    
    // Set up periodic updates - fetch every 30 seconds
    setInterval(fetchWeatherData, 30000);
});
