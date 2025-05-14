// Replace the initial weatherData object with an empty structure
const weatherData = {
    current: {
        temp: 0,
        hum: 0,
        pressure: 0
    },
    hourly: [],
    weekly: []
};

// Replace wurzburgWeatherData with empty data
let wurzburgWeatherData = {
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
function renderForecast(type) {
    if (!forecastList) {
        forecastList = document.querySelector('.forecast-list');
    }
    
    if (!forecastList) return;
    
    const data = weatherData[type];
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
                label: wurzburgWeatherData[type].label,
                data: wurzburgWeatherData[type].values,
                borderColor: wurzburgWeatherData[type].color,
                backgroundColor: wurzburgWeatherData[type].color + '33', // Add transparency
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
        const response = await fetch('http://192.168.108.13:8081/wuerzburg');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        processApiData(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Process the API data and update our data objects
function processApiData(apiData) {
    if (!apiData || apiData.length === 0) return;
    
    // Update current weather with the latest data point
    const latest = apiData[0];
    weatherData.current.temp = Math.round(latest.temp);
    weatherData.current.hum = latest.hum;
    weatherData.current.pressure = Math.round(latest.pressure);
    
    // Create hourly forecast from API data
    weatherData.hourly = apiData.slice(0, 8).map((item, index) => {
        const date = new Date(item.time);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        return {
            time: index === 0 ? "Now" : `${hours}:${minutes < 10 ? '0' + minutes : minutes}`,
            temp: Math.round(item.temp),
            hum: item.hum,
            pressure: Math.round(item.pressure)
        };
    });
    
    // For weekly forecast, we'll simulate it based on the latest data
    weatherData.weekly = [
        { time: "Today", temp: Math.round(latest.temp), hum: latest.hum, pressure: Math.round(latest.pressure) }
    ];
    
    // Add some simulated days based on the current data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    for (let i = 1; i < 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        const dayName = days[nextDay.getDay()];
        
        // Create some variation in the forecast
        const tempVariation = Math.round((Math.random() * 6) - 3); // -3 to +3
        const humVariation = Math.round((Math.random() * 10) - 5); // -5 to +5
        const pressureVariation = Math.round((Math.random() * 6) - 3); // -3 to +3
        
        weatherData.weekly.push({
            time: dayName,
            temp: Math.round(latest.temp) + tempVariation,
            hum: Math.max(0, Math.min(100, latest.hum + humVariation)),
            pressure: Math.round(latest.pressure) + pressureVariation
        });
    }
    
    // Update the chart data
    // Extract dates for labels
    const newLabels = apiData.map(item => {
        const date = new Date(item.time);
        return `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
    });
    
    // Update the labels array
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));
    
    // Update the chart data
    wurzburgWeatherData.temperature.values = apiData.map(item => item.temp);
    wurzburgWeatherData.humidity.values = apiData.map(item => item.hum);
    wurzburgWeatherData.pressure.values = apiData.map(item => item.pressure);
    
    // Update the current chart if it exists and is visible
    if (currentChart && graphVisible) {
        const activeButton = document.querySelector('.graph-button.active');
        if (activeButton) {
            updateChart(activeButton.dataset.type);
        } else {
            updateChart('temperature');
        }
    }
    
    // Update the UI with new forecast data
    const activeBtn = document.querySelector('.forecast-btn.active');
    if (activeBtn) {
        renderForecast(activeBtn.textContent.toLowerCase().includes('hourly') ? 'hourly' : 'weekly');
    } else {
        renderForecast('hourly');
    }
}

// Add this function to filter data by date range
async function fetchDataByDateRange(startDate, endDate) {
  try {
    // Format dates for API request
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Construct URL with date parameters
    const url = `http://192.168.108.13:8081/wuerzburg?start=${formattedStartDate}&end=${formattedEndDate}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    
    const data = await response.json();
    processApiData(data);
    
    // If graph is visible, update it
    if (graphVisible) {
      const activeButton = document.querySelector('.graph-button.active');
      if (activeButton) {
        updateChart(activeButton.dataset.type);
      }
    }
  } catch (error) {
    console.error('Error fetching data by date range:', error);
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
    
    // Set default dates (today and a week from today)
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    document.getElementById('start-date').valueAsDate = lastWeek;
    document.getElementById('end-date').valueAsDate = today;
    
    // Set up forecast button event listeners
    const forecastBtns = document.querySelectorAll('.forecast-btn');
    forecastBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            forecastBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderForecast(btn.textContent.toLowerCase().includes('hourly') ? 'hourly' : 'weekly');
        });
    });
    
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
    document.getElementById('show-graph-btn').addEventListener('click', () => {
        // Get date range values before toggling graph
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            
            // Fetch data with the selected date range
            fetchDataByDateRange(startDate, endDate);
        }
        
        toggleGraph();
    });
    
    // Initial fetch and render
    fetchWeatherData();
    
    // Set up periodic updates - fetch every 30 seconds
    setInterval(fetchWeatherData, 30000);
});
