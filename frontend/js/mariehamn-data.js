// Initial weather data (will be replaced with API data)
const weatherData = {
    current: {
        temp: 19,
        hum: 68,
        pressure: 1013,
        feelsLike: 18,
        windSpeed: 12
    },
    hourly: [
        { time: "Now", temp: 19, hum: 68, pressure: 1013 },
        { time: "2 PM", temp: 20, hum: 65, pressure: 1012 },
        { time: "4 PM", temp: 21, hum: 62, pressure: 1012 },
        { time: "6 PM", temp: 19, hum: 70, pressure: 1011 },
        { time: "8 PM", temp: 17, hum: 75, pressure: 1011 },
        { time: "10 PM", temp: 16, hum: 78, pressure: 1010 },
        { time: "12 AM", temp: 15, hum: 80, pressure: 1010 },
        { time: "2 AM", temp: 14, hum: 82, pressure: 1009 }
    ],
    weekly: [
        { time: "Today", temp: 19, hum: 68, pressure: 1013 },
        { time: "Tue", temp: 22, hum: 60, pressure: 1014 },
        { time: "Wed", temp: 20, hum: 65, pressure: 1012 },
        { time: "Thu", temp: 18, hum: 85, pressure: 1009 },
        { time: "Fri", temp: 17, hum: 80, pressure: 1010 },
        { time: "Sat", temp: 21, hum: 62, pressure: 1015 },
        { time: "Sun", temp: 20, hum: 65, pressure: 1013 }
    ]
};

// Global variables for DOM elements
let forecastList;
let currentTemp;

// Global function for updating current weather
function updateCurrentWeather(data) {
    if (!currentTemp) {
        currentTemp = document.querySelector('.temp-display');
    }
    
    if (currentTemp) {
        currentTemp.textContent = `${data.temp}°C`;
    }
    
    const humidityElement = document.querySelector('.humidity-value');
    const pressureElement = document.querySelector('.pressure-value');
    
    if (humidityElement) {
        humidityElement.textContent = `${data.hum}%`;
    }
    
    if (pressureElement) {
        pressureElement.textContent = `${data.pressure} hPa`;
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

// Process the API data and update our weatherData object
function processApiData(apiData) {
    if (!apiData || apiData.length === 0) return;
    
    // Update current weather with the latest data point
    const latest = apiData[0];
    weatherData.current.temp = Math.round(latest.temp);
    weatherData.current.hum = latest.hum;
    weatherData.current.pressure = Math.round(latest.pressure);
    
    // Create hourly forecast from API data
    // We'll use the available data points and format them for hourly display
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
    // In a real app, you'd want actual forecast data
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
    
    // Update the UI with new data
    const activeBtn = document.querySelector('.forecast-btn.active');
    if (activeBtn) {
        renderForecast(activeBtn.textContent.toLowerCase().includes('hourly') ? 'hourly' : 'weekly');
    } else {
        renderForecast('hourly');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    forecastList = document.querySelector('.forecast-list');
    currentTemp = document.querySelector('.temp-display');
    const forecastBtns = document.querySelectorAll('.forecast-btn');
    
    // Add weather details section if it doesn't exist
    if (!document.querySelector('.weather-details')) {
        const weatherDetails = document.createElement('div');
        weatherDetails.className = 'weather-details';
        weatherDetails.innerHTML = `
            <div class="detail-card">
                <i class="fas fa-tint detail-icon"></i>
                <div class="humidity-value">68%</div>
                <div class="detail-label">Humidity</div>
            </div>
            <div class="detail-card">
                <i class="fas fa-compress-alt detail-icon"></i>
                <div class="pressure-value">1013 hPa</div>
                <div class="detail-label">Pressure</div>
            </div>
        `;
        document.querySelector('.current-weather').after(weatherDetails);
    }

    forecastBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            forecastBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderForecast(btn.textContent.toLowerCase().includes('hourly') ? 'hourly' : 'weekly');
        });
    });

    // Initial fetch and render
    fetchWeatherData();
    
    // Set up periodic updates
    setInterval(fetchWeatherData, 60000); // Update every minute
    
    // Initial render with default data
    renderForecast('hourly');
});
