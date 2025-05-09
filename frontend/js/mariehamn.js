let currentChart = null;
let graphVisible = false;

// Weather data object with initial values
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

// Initial labels
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

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
                backgroundColor: marienhamnWeatherData[type].color + '33', // Add transparency
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
async function fetchDataMarienhamn() {
    try {
        // TODO change to mariehamn later
        const response = await fetch('http://192.168.108.13:8081/wuerzburg');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        processMarienhamnWeatherData(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Process the fetched data
function processMarienhamnWeatherData(data) {
    if (!data || data.length === 0) return;
    
    // Extract dates for labels
    const newLabels = data.map(item => {
        const date = new Date(item.time);
        return `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
    });
    
    // Update the labels array
    labels.length = 0;
    newLabels.forEach(label => labels.push(label));
    
    // Update the data
    marienhamnWeatherData.temperature.values = data.map(item => item.temp);
    marienhamnWeatherData.humidity.values = data.map(item => item.hum);
    marienhamnWeatherData.pressure.values = data.map(item => item.pressure);
    
    // Update the current chart if it exists and is visible
    if (currentChart && graphVisible) {
        const activeButton = document.querySelector('.graph-button.active');
        if (activeButton) {
            updateChart(activeButton.dataset.type);
        } else {
            updateChart('temperature');
        }
    }
    
    // Also update the current weather display
    updateCurrentWeatherDisplay(data[0]);
}

// Update the current weather display with the latest data
function updateCurrentWeatherDisplay(latestData) {
    if (latestData) {
        document.querySelector('.temp-display').textContent = `${Math.round(latestData.avg_temp_c)}°C`;
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
    // Set default dates (today and a week from today)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    document.getElementById('start-date').valueAsDate = today;
    document.getElementById('end-date').valueAsDate = nextWeek;
    
    // Graph type buttons
    const buttons = document.querySelectorAll('.graph-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            
            if (graphVisible) {
                updateChart(button.dataset.type);
            }
        });
    });
    
    // Show/Hide graph button
    document.getElementById('show-graph-btn').addEventListener('click', toggleGraph);
    
    // Fetch data initially and then every 5 seconds
    fetchDataMarienhamn();
    setInterval(fetchDataMarienhamn, 5000);
});
