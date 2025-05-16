// Weather data objects with initial values
const weatherData = {
    mariehamn: {
        hourly: []
    },
    wurzburg: {
        hourly: []
    }
};

// Chart data for comparison
const comparisonData = {
    temperature: {
        label: 'Temperature (°C)',
        mariehamn: [],
        wurzburg: [],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    },
    humidity: {
        label: 'Humidity (%)',
        mariehamn: [],
        wurzburg: [],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    },
    pressure: {
        label: 'Pressure (hPa)',
        mariehamn: [],
        wurzburg: [],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    }
};

// Global variables
let currentChart = null;
const labels = [];
let activeCity = 'both'; // Default to showing both cities
let lastDataTimestamp = null;

// Function to update the chart with the selected data type
function updateChart(type) {
    if (currentChart) {
        currentChart.destroy();
    }

    // Make sure we have data to display
    if (comparisonData[type].mariehamn.length === 0 || comparisonData[type].wurzburg.length === 0) {
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
            datasets: [
                {
                    label: `Mariehamn ${comparisonData[type].label}`,
                    data: comparisonData[type].mariehamn,
                    borderColor: comparisonData[type].mariehamn_color,
                    backgroundColor: comparisonData[type].mariehamn_color + '33',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: `Würzburg ${comparisonData[type].label}`,
                    data: comparisonData[type].wurzburg,
                    borderColor: comparisonData[type].wurzburg_color,
                    backgroundColor: comparisonData[type].wurzburg_color + '33',
                    tension: 0.1,
                    fill: true
                }
            ]
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

// Function to render the forecast based on active city selection
function renderForecast() {
    const forecastList = document.getElementById('comparison-forecast');
    if (!forecastList) return;
    
    let forecastHTML = '';
    
    if (activeCity === 'both' || activeCity === 'mariehamn') {
        if (weatherData.mariehamn.hourly.length > 0) {
            weatherData.mariehamn.hourly.forEach((item, index) => {
                forecastHTML += `
                    <div class="forecast-item mariehamn">
                        <div class="city-indicator">Mariehamn</div>
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
                `;
            });
        } else {
            forecastHTML += `
                <div class="forecast-item mariehamn">
                    <div class="city-indicator">Mariehamn</div>
                    <span>Loading data...</span>
                </div>
            `;
        }
    }
    
    if (activeCity === 'both' || activeCity === 'wurzburg') {
        if (weatherData.wurzburg.hourly.length > 0) {
            weatherData.wurzburg.hourly.forEach((item, index) => {
                forecastHTML += `
                    <div class="forecast-item wurzburg">
                        <div class="city-indicator">Würzburg</div>
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
                `;
            });
        } else {
            forecastHTML += `
                <div class="forecast-item wurzburg">
                    <div class="city-indicator">Würzburg</div>
                    <span>Loading data...</span>
                </div>
            `;
        }
    }
    
    forecastList.innerHTML = forecastHTML;
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

// Function to fetch data from the API for both cities
async function fetchWeatherData() {
    try {
        // Fetch data for both cities
        const [wurzburgResponse, mariehamnResponse] = await Promise.all([
            fetch('http://192.168.108.13:8081/wuerzburg'),
            fetch('http://192.168.108.13:8081/mariehamn')
        ]);
        
        let wurzburgData = [];
        let mariehamnData = [];
        
        if (wurzburgResponse.ok) {
            wurzburgData = await wurzburgResponse.json();
        } else {
            console.error('Failed to fetch Würzburg data');
            wurzburgData = generateDummyData(22); // Slightly warmer for Wurzburg
        }
        
        if (mariehamnResponse.ok) {
            mariehamnData = await mariehamnResponse.json();
        } else {
            console.error('Failed to fetch Mariehamn data');
            mariehamnData = generateDummyData(19); // Slightly cooler for Mariehamn
        }
        
        processApiData(wurzburgData, mariehamnData);
        updateLastUpdatedTime();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        
        // Use dummy data if fetch fails
        const wurzburgData = generateDummyData(22);
        const mariehamnData = generateDummyData(19);
        processApiData(wurzburgData, mariehamnData);
        updateLastUpdatedTime();
    }
}

// Generate realistic dummy data for testing
function generateDummyData(baseTemp) {
    const now = new Date();
    const data = [];

    for (let i = 0; i < 24; i++) {
        const time = new Date(now);
        time.setHours(now.getHours() - i);
        time.setMinutes(0);

        data.push({
            time: time.toISOString(),
            temp: baseTemp - (i * 0.5) + (Math.random() * 2 - 1),
            hum: 65 + (Math.random() * 20 - 10),
            pressure: 1010 + (Math.random() * 10 - 5)
        });
    }

    return data;
}

// Process the API data and update our data objects
function processApiData(wurzburgApiData, mariehamnApiData) {
    if ((!wurzburgApiData || wurzburgApiData.length === 0) && 
        (!mariehamnApiData || mariehamnApiData.length === 0)) {
        console.error("No data received from API for either city");
        return;
    }
    
    // Check if data has changed
    const wurzburgTimestamp = wurzburgApiData[0]?.time || new Date().toISOString();
    const mariehamnTimestamp = mariehamnApiData[0]?.time || new Date().toISOString();
    const combinedTimestamp = wurzburgTimestamp + mariehamnTimestamp;
    
    if (combinedTimestamp === lastDataTimestamp) {
        console.log('Data unchanged since last fetch');
        return;
    }
    lastDataTimestamp = combinedTimestamp;
    
    // Process Würzburg data
    const processedWurzburgData = [];
    
    // Add the latest data point as "Now"
    if (wurzburgApiData.length > 0) {
        const latestWurzburg = wurzburgApiData[0];
        processedWurzburgData.push({
            time: "Now",
            temp: Math.round(latestWurzburg.temp),
            hum: Math.round(latestWurzburg.hum),
            pressure: Math.round(latestWurzburg.pressure)
        });
        
        // Process the next 5 data points with their actual timestamps
        for (let i = 1; i < Math.min(6, wurzburgApiData.length); i++) {
            const dataPoint = wurzburgApiData[i];
            const dataTime = new Date(dataPoint.time);
            
            // Format time as HH:MM AM/PM
            const hours = dataTime.getHours();
            const minutes = dataTime.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12; // Convert to 12-hour format
            const timeLabel = `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
            
            processedWurzburgData.push({
                time: timeLabel,
                temp: Math.round(dataPoint.temp),
                hum: Math.round(dataPoint.hum),
                pressure: Math.round(dataPoint.pressure)
            });
        }
    }
    
    // Process Mariehamn data
    const processedMariehamnData = [];
    
    // Add the latest data point as "Now"
    if (mariehamnApiData.length > 0) {
        const latestMariehamn = mariehamnApiData[0];
        processedMariehamnData.push({
            time: "Now",
            temp: Math.round(latestMariehamn.temp),
            hum: Math.round(latestMariehamn.hum),
            pressure: Math.round(latestMariehamn.pressure)
        });
        
        // Process the next 5 data points with their actual timestamps
        for (let i = 1; i < Math.min(6, mariehamnApiData.length); i++) {
            const dataPoint = mariehamnApiData[i];
            const dataTime = new Date(dataPoint.time);
            
            // Format time as HH:MM AM/PM
            const hours = dataTime.getHours();
            const minutes = dataTime.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12; // Convert to 12-hour format
            const timeLabel = `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
            
            processedMariehamnData.push({
                time: timeLabel,
                temp: Math.round(dataPoint.temp),
                hum: Math.round(dataPoint.hum),
                pressure: Math.round(dataPoint.pressure)
            });
        }
    }
    
    // Update the weather data with processed hourly data
    weatherData.wurzburg.hourly = processedWurzburgData;
    weatherData.mariehamn.hourly = processedMariehamnData;
    
    // Create new labels for the chart (use Würzburg times if available, otherwise Mariehamn)
    const timeData = processedWurzburgData.length > 0 ? processedWurzburgData : processedMariehamnData;
    const newLabels = timeData.map(item => item.time);
    
    // Update the labels array
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));
    
    // Update the chart data
    comparisonData.temperature.wurzburg = processedWurzburgData.map(item => item.temp);
    comparisonData.humidity.wurzburg = processedWurzburgData.map(item => item.hum);
    comparisonData.pressure.wurzburg = processedWurzburgData.map(item => item.pressure);
    
    comparisonData.temperature.mariehamn = processedMariehamnData.map(item => item.temp);
    comparisonData.humidity.mariehamn = processedMariehamnData.map(item => item.hum);
    comparisonData.pressure.mariehamn = processedMariehamnData.map(item => item.pressure);
    
    // Update the current chart if it exists
    const activeButton = document.querySelector('.graph-button.active');
    if (activeButton) {
        updateChart(activeButton.dataset.type);
    } else {
        updateChart('temperature');
    }
    
    // Update the forecast display
    renderForecast();
}

document.addEventListener('DOMContentLoaded', () => {
    const graphButtons = document.querySelectorAll('.graph-button');
    graphButtons.forEach(button => {
        button.addEventListener('click', () => {
            graphButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            updateChart(button.dataset.type);
        });
    });
    
    // City toggle buttons
    const forecastBtns = document.querySelectorAll('.forecast-btn');
    forecastBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            forecastBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCity = btn.dataset.city;
            renderForecast();
        });
    });
    
    // Initialize with dummy data immediately
    const wurzburgData = generateDummyData(22); // Slightly warmer for Wurzburg
    const mariehamnData = generateDummyData(19); // Slightly cooler for Mariehamn
    processApiData(wurzburgData, mariehamnData);
    
    // Then try to fetch real data
    fetchWeatherData();
    
    // Poll every 5 minutes
    setInterval(fetchWeatherData, 300000);
});
