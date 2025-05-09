// Weather data objects with initial values
const weatherData = {
    mariehamn: {
        hourly: [
            { time: "Now", temp: 19, hum: 68, pressure: 1013 },
            { time: "11 PM", temp: 18, hum: 70, pressure: 1012 },
            { time: "10 PM", temp: 17, hum: 72, pressure: 1012 },
            { time: "9 PM", temp: 16, hum: 75, pressure: 1011 }
        ]
    },
    wurzburg: {
        hourly: [
            { time: "Now", temp: 22, hum: 60, pressure: 1015 },
            { time: "11 PM", temp: 21, hum: 62, pressure: 1014 },
            { time: "10 PM", temp: 20, hum: 65, pressure: 1013 },
            { time: "9 PM", temp: 19, hum: 68, pressure: 1012 }
        ]
    }
};

// Chart data for comparison
const comparisonData = {
    temperature: {
        label: 'Temperature (°C)',
        mariehamn: [19, 18, 17, 16, 15, 14],
        wurzburg: [22, 21, 20, 19, 18, 17],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    },
    humidity: {
        label: 'Humidity (%)',
        mariehamn: [68, 70, 72, 75, 78, 80],
        wurzburg: [60, 62, 65, 68, 70, 72],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    },
    pressure: {
        label: 'Pressure (hPa)',
        mariehamn: [1013, 1012, 1012, 1011, 1011, 1010],
        wurzburg: [1015, 1014, 1013, 1012, 1012, 1011],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    }
};

// Global variables
let currentChart = null;
const labels = ['Now', '11 PM', '10 PM', '9 PM', '8 PM', '7 PM'];
let activeCity = 'both'; // Default to showing both cities

// Function to update the chart with the selected data type
function updateChart(type) {
    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(document.getElementById('weatherChart'), {
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
    }
    
    if (activeCity === 'both' || activeCity === 'wurzburg') {
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
    }
    
    forecastList.innerHTML = forecastHTML;
}

// Function to fetch data from the API for both cities
async function fetchWeatherData() {
    try {
        // For now, both fetch from the same endpoint
        // Later, one will be changed to mariehamn
        const [wurzburgResponse, mariehamnResponse] = await Promise.all([
            fetch('http://192.168.108.13:8081/wuerzburg'),
            fetch('http://192.168.108.13:8081/wuerzburg')
        ]);
        
        if (!wurzburgResponse.ok || !mariehamnResponse.ok) {
            throw new Error('Network response was not ok');
        }
        
        const wurzburgData = await wurzburgResponse.json();
        const mariehamnData = await mariehamnResponse.json();
        
        processApiData(wurzburgData, mariehamnData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Process the API data and update our data objects
function processApiData(wurzburgApiData, mariehamnApiData) {
    if (!wurzburgApiData || !mariehamnApiData || wurzburgApiData.length === 0 || mariehamnApiData.length === 0) return;
    
    // Create hourly historical data from API data
    // We'll use the most recent data points and format them as hourly intervals
    
    // Process Würzburg data
    const processedWurzburgData = [];
    const now = new Date();
    
    // Get the most recent data point for "Now"
    const latestWurzburg = wurzburgApiData[0];
    processedWurzburgData.push({
        time: "Now",
        temp: Math.round(latestWurzburg.temp),
        hum: latestWurzburg.hum,
        pressure: Math.round(latestWurzburg.pressure)
    });
    
    // Create hourly historical data points
    for (let i = 1; i < Math.min(6, wurzburgApiData.length); i++) {
        const dataPoint = wurzburgApiData[i];
        const hourOffset = i;
        const pastHour = new Date(now);
        pastHour.setHours(now.getHours() - hourOffset);
        
        const hourStr = pastHour.getHours();
        const ampm = hourStr >= 12 ? 'PM' : 'AM';
        const hour12 = hourStr % 12 || 12; // Convert to 12-hour format
        
        processedWurzburgData.push({
            time: `${hour12} ${ampm}`,
            temp: Math.round(dataPoint.temp),
            hum: dataPoint.hum,
            pressure: Math.round(dataPoint.pressure)
        });
    }
    
    // Process Mariehamn data (same approach)
    const processedMariehamnData = [];
    
    // Get the most recent data point for "Now"
    const latestMariehamn = mariehamnApiData[0];
    processedMariehamnData.push({
        time: "Now",
        temp: Math.round(latestMariehamn.temp),
        hum: latestMariehamn.hum,
        pressure: Math.round(latestMariehamn.pressure)
    });
    
    // Create hourly historical data points
    for (let i = 1; i < Math.min(6, mariehamnApiData.length); i++) {
        const dataPoint = mariehamnApiData[i];
        const hourOffset = i;
        const pastHour = new Date(now);
        pastHour.setHours(now.getHours() - hourOffset);
        
        const hourStr = pastHour.getHours();
        const ampm = hourStr >= 12 ? 'PM' : 'AM';
        const hour12 = hourStr % 12 || 12; // Convert to 12-hour format
        
        processedMariehamnData.push({
            time: `${hour12} ${ampm}`,
            temp: Math.round(dataPoint.temp),
            hum: dataPoint.hum,
            pressure: Math.round(dataPoint.pressure)
        });
    }
    
    // Update the weather data with processed hourly data
    weatherData.wurzburg.hourly = processedWurzburgData;
    weatherData.mariehamn.hourly = processedMariehamnData;
    
    // Update the chart data
    // Create new labels for the chart (hourly format)
    const newLabels = processedWurzburgData.map(item => item.time);
    
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
    // Set default dates (today and a week ago)
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    document.getElementById('start-date').valueAsDate = lastWeek;
    document.getElementById('end-date').valueAsDate = today;
    
    // Update the title of the forecast toggle section to reflect historical data
    const forecastToggleTitle = document.querySelector('.forecast-toggle');
    if (forecastToggleTitle) {
        const newTitle = document.createElement('h3');
        newTitle.textContent = 'Historical Weather Data';
        newTitle.style.textAlign = 'center';
        newTitle.style.marginBottom = '10px';
        forecastToggleTitle.parentNode.insertBefore(newTitle, forecastToggleTitle);
    }
    
    // Update the button text to reflect historical data
    const forecastBtns = document.querySelectorAll('.forecast-btn');
    forecastBtns.forEach(btn => {
        if (btn.dataset.city === 'both') btn.textContent = 'Both Cities';
        if (btn.dataset.city === 'mariehamn') btn.textContent = 'Mariehamn';
        if (btn.dataset.city === 'wurzburg') btn.textContent = 'Würzburg';
        
        btn.addEventListener('click', () => {
            forecastBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCity = btn.dataset.city;
            renderForecast();
        });
    });
    
    // Graph type buttons
    const graphButtons = document.querySelectorAll('.graph-button');
    graphButtons.forEach(button => {
        button.addEventListener('click', () => {
            graphButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            updateChart(button.dataset.type);
        });
    });
    
    // Date range update button
    document.getElementById('update-date-btn').addEventListener('click', () => {
        fetchWeatherData();
    });
    
    // Initial fetch and render
    fetchWeatherData();
    
    // Set up periodic updates - fetch every 30 seconds
    setInterval(fetchWeatherData, 30000);
});
