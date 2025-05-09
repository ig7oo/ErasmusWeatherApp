// Weather data objects with initial values
const weatherData = {
    mariehamn: {
        hourly: [
            { time: "Now", temp: 19, hum: 68, pressure: 1013 },
            { time: "2 PM", temp: 20, hum: 65, pressure: 1012 },
            { time: "4 PM", temp: 21, hum: 62, pressure: 1012 },
            { time: "6 PM", temp: 19, hum: 70, pressure: 1011 }
        ]
    },
    wurzburg: {
        hourly: [
            { time: "Now", temp: 22, hum: 60, pressure: 1015 },
            { time: "2 PM", temp: 23, hum: 58, pressure: 1014 },
            { time: "4 PM", temp: 24, hum: 55, pressure: 1013 },
            { time: "6 PM", temp: 22, hum: 62, pressure: 1012 }
        ]
    }
};

// Chart data for comparison
const comparisonData = {
    temperature: {
        label: 'Temperature (°C)',
        mariehamn: [2, 4, 8, 12, 18, 22],
        wurzburg: [5, 8, 12, 16, 22, 26],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    },
    humidity: {
        label: 'Humidity (%)',
        mariehamn: [85, 80, 75, 70, 65, 60],
        wurzburg: [75, 70, 65, 60, 55, 50],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    },
    pressure: {
        label: 'Pressure (hPa)',
        mariehamn: [1013, 1015, 1012, 1010, 1014, 1016],
        wurzburg: [1015, 1017, 1014, 1012, 1016, 1018],
        mariehamn_color: '#ff6384',
        wurzburg_color: '#36a2eb'
    }
};

// Global variables
let currentChart = null;
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
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
    
    // Create hourly forecast from API data
    weatherData.wurzburg.hourly = wurzburgApiData.slice(0, 4).map((item, index) => {
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
    
    weatherData.mariehamn.hourly = mariehamnApiData.slice(0, 4).map((item, index) => {
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
    
    // Update the chart data
    // Extract dates for labels
    const newLabels = wurzburgApiData.map(item => {
        const date = new Date(item.time);
        return `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
    });
    
    // Update the labels array
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));
    
    // Update the chart data
    comparisonData.temperature.wurzburg = wurzburgApiData.map(item => item.temp);
    comparisonData.humidity.wurzburg = wurzburgApiData.map(item => item.hum);
    comparisonData.pressure.wurzburg = wurzburgApiData.map(item => item.pressure);
    
    comparisonData.temperature.mariehamn = mariehamnApiData.map(item => item.temp);
    comparisonData.humidity.mariehamn = mariehamnApiData.map(item => item.hum);
    comparisonData.pressure.mariehamn = mariehamnApiData.map(item => item.pressure);
    
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
    // Set default dates (today and a week from today)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    document.getElementById('start-date').valueAsDate = today;
    document.getElementById('end-date').valueAsDate = nextWeek;
    
    // Graph type buttons
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
    
    // Date range update button
    document.getElementById('update-date-btn').addEventListener('click', () => {
        fetchWeatherData();
    });
    
    // Initial fetch and render
    fetchWeatherData();
    
    // Set up periodic updates - fetch every 30 seconds
    setInterval(fetchWeatherData, 30000);
});
