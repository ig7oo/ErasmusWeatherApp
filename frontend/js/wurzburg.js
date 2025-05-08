let currentChart = null;

const data = {
    temperature: {
        label: 'Temperature (°C)',
        values: [2, 4, 8, 12, 18, 22],
        color: '#ff6384'
    },
    humidity: {
        label: 'Humidity (%)',
        values: [85, 80, 75, 70, 65, 60],
        color: '#36a2eb'
    },
    pressure: {
        label: 'Pressure (hPa)',
        values: [1013, 1015, 1012, 1010, 1014, 1016],
        color: '#4bc0c0'
    }
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function updateChart(type) {
    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(document.getElementById('weatherChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: wuerzburgWeatherData[type].label,
                data: wuerzburgWeatherData[type].values,
                borderColor: wuerzburgWeatherData[type].color,
                tension: 0.1
            }]
        }
    });
}

async function fetchDataWuerzburg() {
    try {
        const response = await fetch('/get/wuerzburg');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const wuerzburgWeatherData = await response.json();
        processWuerzrburgWeatherData(wuerzburgWeatherData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function processWuerzrburgWeatherData(wuerzburgWeatherData) {
    const output = wuerzburgWeatherData.map(item => {
        return {
            temperature: item.temperature,
            humidity: item.humidity,
            timestamp: item.timestamp
        };
        
    })
}

setInterval(fetchDataWuerzburg, 5000);

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.graph-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            updateChart(button.dataset.type);
        });
    });

    // Initialize with temperature graph
    updateChart('temperature');
});
