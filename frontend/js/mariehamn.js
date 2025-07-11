// Replace the initial weatherData object with an empty structure
const weatherData = {
    hourly: []
};

// Replace marienhamnWeatherData with empty data
let marienhamnWeatherData = {
    temperature: {
        label: 'Temperature (°C)',
        values: [],
        color: '#ff6384'
    },
    humidity: {
        label: 'Humidity (%)',
        values: [],
        color: '#36a2eb'
    },
    pressure: {
        label: 'Pressure (hPa)',
        values: [],
        color: '#4bc0c0'
    }
};

// Global variables
let currentChart = null;
let forecastList;
let currentTemp;
const labels = [];
let lastDataTimestamp = null;
let activeType = 'temperature'; // Default chart type

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

    if (data && data.length > 0) {
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

        if (data[0]) {
            updateCurrentWeather(data[0]);
        }
    } else {
        forecastList.innerHTML = '<div class="forecast-item">Loading weather data...</div>';
    }
}

// Function to update the chart with the selected data type
function updateChart(type) {
    if (currentChart) {
        currentChart.destroy();
    }

    // Make sure we have data to display
    if (marienhamnWeatherData[type].values.length === 0) {
        console.log("No data available for chart");
        return;
    }

    const ctx = document.getElementById('weatherChart');
    if (!ctx) {
        console.error("Canvas element not found");
        return;
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: marienhamnWeatherData[type].label,
                data: marienhamnWeatherData[type].values,
                borderColor: marienhamnWeatherData[type].color,
                backgroundColor: marienhamnWeatherData[type].color + '33',
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

// Add a last updated indicator
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Last updated: ${timeString}`;
    }
}

// Function to fetch data from the API
async function fetchWeatherData() {
    try {
        const response = await fetch('http://192.168.108.13:8081/mariehamn');

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        processApiData(data);
        updateLastUpdatedTime();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);

        // Always use dummy data when API is unavailable
        const dummyData = generateDummyData();
        processApiData(dummyData);
        updateLastUpdatedTime();
    }
}

// Generate realistic dummy data for testing
function generateDummyData() {
    const now = new Date();
    const data = [];

    for (let i = 0; i < 24; i++) {
        const time = new Date(now);
        time.setHours(now.getHours() - i);
        time.setMinutes(0);

        data.push({
            time: time.toISOString(),
            temp: 20 - (i * 0.5) + (Math.random() * 2 - 1),
            hum: 65 + (Math.random() * 20 - 10),
            pressure: 1010 + (Math.random() * 10 - 5)
        });
    }

    return data;
}

// Process the API data and update our data objects
function processApiData(apiData) {
    if (!apiData || apiData.length === 0) {
        console.error("No data received from API");
        // Generate dummy data if no data is available
        apiData = generateDummyData();
    }

    const dataTimestamp = apiData[0]?.time || new Date().toISOString();
    if (dataTimestamp === lastDataTimestamp) {
        console.log('Data unchanged since last fetch');
        return;
    }
    lastDataTimestamp = dataTimestamp;

    const processedHourlyData = [];

    // Add the latest data point as "Now"
    const latest = apiData[0];
    processedHourlyData.push({
        time: "Now",
        temp: Math.round(latest.temp),
        hum: Math.round(latest.hum),
        pressure: Math.round(latest.pressure)
    });

    // Process the next 5 data points with their actual timestamps
    for (let i = 1; i < Math.min(6, apiData.length); i++) {
        const dataPoint = apiData[i];
        const dataTime = new Date(dataPoint.time);
        
        // Format time as HH:MM
        const hours = dataTime.getHours();
        const minutes = dataTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12; // Convert to 12-hour format
        const timeLabel = `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

        processedHourlyData.push({
            time: timeLabel,
            temp: Math.round(dataPoint.temp),
            hum: Math.round(dataPoint.hum),
            pressure: Math.round(dataPoint.pressure)
        });
    }

    weatherData.hourly = processedHourlyData;

    // Clear and update labels
    labels.length = 0;
    processedHourlyData.forEach(item => labels.push(item.time));

    // Update data for charts
    marienhamnWeatherData.temperature.values = processedHourlyData.map(item => item.temp);
    marienhamnWeatherData.humidity.values = processedHourlyData.map(item => item.hum);
    marienhamnWeatherData.pressure.values = processedHourlyData.map(item => item.pressure);

    // Update chart with current data
    updateChart(activeType);

    updateCurrentWeatherDisplay(latest);
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

document.addEventListener('DOMContentLoaded', () => {
    forecastList = document.querySelector('.forecast-list');
    currentTemp = document.querySelector('.temp-display');

    const graphButtons = document.querySelectorAll('.graph-button');
    graphButtons.forEach(button => {
        button.addEventListener('click', () => {
            graphButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            activeType = button.dataset.type;
            updateChart(activeType);
        });
    });

    // Initialize with dummy data immediately
    const dummyData = generateDummyData();
    processApiData(dummyData);
    
    // Then try to fetch real data
    fetchWeatherData();

    // Poll every 5 minutes
    setInterval(fetchWeatherData, 300000);
});
