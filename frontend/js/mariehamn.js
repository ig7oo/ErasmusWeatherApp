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
let graphVisible = false;
let forecastList;
let currentTemp;
const labels = [];
let lastDataTimestamp = null;

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

    currentChart = new Chart(document.getElementById('weatherChart'), {
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

        // Use dummy data only if no data has been loaded yet
        if (!weatherData.hourly.length) {
            const dummyData = generateDummyData();
            processApiData(dummyData);
        }

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
        renderForecast();
        return;
    }

    const dataTimestamp = apiData[0].time;
    if (dataTimestamp === lastDataTimestamp) {
        console.log('Data unchanged since last fetch');
        return;
    }
    lastDataTimestamp = dataTimestamp;

    const now = new Date();
    const currentHour = now.getHours();

    const processedHourlyData = [];

    const latest = apiData[0];
    processedHourlyData.push({
        time: "Now",
        temp: Math.round(latest.temp),
        hum: Math.round(latest.hum),
        pressure: Math.round(latest.pressure)
    });

    for (let i = 1; i <= 5; i++) {
        const targetHour = currentHour - i;
        const displayHour = targetHour < 0 ? targetHour + 24 : targetHour;

        const ampm = displayHour >= 12 ? 'PM' : 'AM';
        const hour12 = displayHour % 12 || 12;
        const timeLabel = `${hour12} ${ampm}`;

        let closestDataPoint = null;
        let smallestTimeDiff = Infinity;

        for (const dataPoint of apiData) {
            const dataTime = new Date(dataPoint.time);
            const dataHour = dataTime.getHours();

            if (dataHour === displayHour) {
                const minutes = dataTime.getMinutes();
                const timeDiff = Math.abs(minutes);

                if (timeDiff < smallestTimeDiff) {
                    smallestTimeDiff = timeDiff;
                    closestDataPoint = dataPoint;
                }
            }
        }

        if (closestDataPoint) {
            processedHourlyData.push({
                time: timeLabel,
                temp: Math.round(closestDataPoint.temp),
                hum: Math.round(closestDataPoint.hum),
                pressure: Math.round(closestDataPoint.pressure)
            });
        } else {
            const prevHourData = processedHourlyData[processedHourlyData.length - 1];
            processedHourlyData.push({
                time: timeLabel,
                temp: prevHourData.temp - 1,
                hum: prevHourData.hum,
                pressure: prevHourData.pressure
            });
        }
    }

    weatherData.hourly = processedHourlyData;

    const newLabels = processedHourlyData.map(item => item.time);
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));

    marienhamnWeatherData.temperature.values = processedHourlyData.map(item => item.temp);
    marienhamnWeatherData.humidity.values = processedHourlyData.map(item => item.hum);
    marienhamnWeatherData.pressure.values = processedHourlyData.map(item => item.pressure);

    if (currentChart && graphVisible) {
        const activeButton = document.querySelector('.graph-button.active');
        if (activeButton) {
            updateChart(activeButton.dataset.type);
        } else {
            updateChart('temperature');
        }
    }

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

// Function to toggle graph visibility
function toggleGraph() {
    const graphContainer = document.getElementById('graph-container');
    const graphButtons = document.getElementById('graph-buttons');
    const showGraphBtn = document.getElementById('show-graph-btn');

    graphVisible = !graphVisible;

    if (graphVisible) {
        graphContainer.style.display = 'block';
        graphButtons.style.display = 'flex';
        showGraphBtn.innerHTML = '<i class="fas fa-chart-line"></i><span>Hide Graph</span>';

        const activeType = document.querySelector('.graph-button.active')?.dataset.type || 'temperature';
        updateChart(activeType);
        graphContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        graphContainer.style.display = 'none';
        graphButtons.style.display = 'none';
        showGraphBtn.innerHTML = '<i class="fas fa-chart-line"></i><span>Show Graph</span>';

        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    forecastList = document.querySelector('.forecast-list');
    currentTemp = document.querySelector('.temp-display');

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    document.getElementById('start-date').valueAsDate = lastWeek;
    document.getElementById('end-date').valueAsDate = today;

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

    document.getElementById('show-graph-btn').addEventListener('click', toggleGraph);

    fetchWeatherData();

    // Poll every 5 minutes instead of 30 seconds
    setInterval(fetchWeatherData, 300000);
});

/* 
  === CHANGELOG: mariehamn.js FIXES ===

  1. Fixed API fetch:
     - Removed 'no-cors' mode.
     - Now uses real API data with response.json().
     - Dummy data used only if no real data is available.

  2. Reduced polling frequency:
     - Changed interval from 30 seconds to 5 minutes (300,000 ms) to match API update rate.

  3. Prevented duplicate updates:
     - Added timestamp check to skip processing if data hasn't changed.
     - Avoids unnecessary chart redraws and UI updates.

  These changes improve data accuracy, stability, and performance.
  
  - Aleks
*/
