const weatherData = {
    current: {
        temp: 19,
        humidity: 68,
        pressure: 1013,
        feelsLike: 18,
        windSpeed: 12
    },
    hourly: [
        { time: "Now", temp: 19, humidity: 68, pressure: 1013 },
        { time: "2 PM", temp: 20, humidity: 65, pressure: 1012 },
        { time: "4 PM", temp: 21, humidity: 62, pressure: 1012 },
        { time: "6 PM", temp: 19, humidity: 70, pressure: 1011 },
        { time: "8 PM", temp: 17, humidity: 75, pressure: 1011 },
        { time: "10 PM", temp: 16, humidity: 78, pressure: 1010 },
        { time: "12 AM", temp: 15, humidity: 80, pressure: 1010 },
        { time: "2 AM", temp: 14, humidity: 82, pressure: 1009 }
    ],
    weekly: [
        { time: "Today", temp: 19, humidity: 68, pressure: 1013 },
        { time: "Tue", temp: 22, humidity: 60, pressure: 1014 },
        { time: "Wed", temp: 20, humidity: 65, pressure: 1012 },
        { time: "Thu", temp: 18, humidity: 85, pressure: 1009 },
        { time: "Fri", temp: 17, humidity: 80, pressure: 1010 },
        { time: "Sat", temp: 21, humidity: 62, pressure: 1015 },
        { time: "Sun", temp: 20, humidity: 65, pressure: 1013 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const forecastBtns = document.querySelectorAll('.forecast-btn');
    const forecastList = document.querySelector('.forecast-list');
    const currentTemp = document.querySelector('.temp-display');

    function updateCurrentWeather(data) {
        currentTemp.textContent = `${data.temp}°C`;
        document.querySelector('.humidity-value').textContent = `${data.hum}%`;
        document.querySelector('.pressure-value').textContent = `${data.pressure} hPa`;
    }

    function renderForecast(type) {
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

    forecastBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            forecastBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderForecast(btn.textContent.toLowerCase().includes('hourly') ? 'hourly' : 'weekly');
        });
    });

    renderForecast('hourly');
});

function updateCurrentWeather(data) {
    document.querySelector('.temp-display').textContent = `${data.temp}°C`;
    document.querySelector('.humidity-value').textContent = `${data.humidity}%`;
    document.querySelector('.pressure-value').textContent = `${data.pressure} hPa`;
}