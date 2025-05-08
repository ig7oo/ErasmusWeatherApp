let currentChart = null;
let marienhamnWeatherData = {
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
                label: marienhamnWeatherData[type].label,
                data: marienhamnWeatherData[type].values,
                borderColor: marienhamnWeatherData[type].color,
                tension: 0.1
            }]
        }
    });
}

async function fetchDataMarienhamn() {
    try {
        const response = await fetch('http://localhost:8081/get/mariehamn');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        processMarienhamnWeatherData(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function processMarienhamnWeatherData(data) {
    // Extract dates for labels
    const newLabels = data.map(item => item.date);
    
    // Update the labels array
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));
    
    // Update the data
    marienhamnWeatherData.temperature.values = data.map(item => item.avg_temp_c);
    marienhamnWeatherData.humidity.values = data.map(item => item.avg_humidity);
    marienhamnWeatherData.pressure.values = data.map(item => item.avg_airpressure);
    
    // Update the current chart
    if (currentChart) {
        const activeButton = document.querySelector('.graph-button.active');
        if (activeButton) {
            updateChart(activeButton.dataset.type);
        } else {
            updateChart('temperature');
        }
    }
}

// Fetch data initially and then every 5 seconds
fetchDataMarienhamn();
setInterval(fetchDataMarienhamn, 5000);

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
