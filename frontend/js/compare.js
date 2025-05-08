let currentChart = null;
let compareData = {
    temperature: {
        label: 'Temperature (°C)',
        mariehamn: [-5, -2, 3, 8, 14, 19],
        wurzburg: [1, 4, 9, 15, 20, 25]
    },
    humidity: {
        label: 'Humidity (%)',
        mariehamn: [90, 88, 82, 75, 70, 72],
        wurzburg: [75, 70, 65, 60, 58, 55]
    },
    pressure: {
        label: 'Pressure (hPa)',
        mariehamn: [1020, 1018, 1015, 1012, 1010, 1013],
        wurzburg: [1015, 1013, 1016, 1014, 1012, 1015]
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
            datasets: [
                {
                    label: `Mariehamn ${compareData[type].label}`,
                    data: compareData[type].mariehamn,
                    borderColor: '#ff6384',
                    tension: 0.1
                },
                {
                    label: `Würzburg ${compareData[type].label}`,
                    data: compareData[type].wurzburg,
                    borderColor: '#36a2eb',
                    tension: 0.1
                }
            ]
        }
    });
}

async function fetchCompareData() {
    try {
        // Fetch Mariehamn data
        const mariehamnResponse = await fetch('http://localhost:8081/get/mariehamn');
        if (!mariehamnResponse.ok) {
            throw new Error('Network response was not ok for Mariehamn data');
        }
        const mariehamnData = await mariehamnResponse.json();
        
        // Fetch Würzburg data
        const wurzburgResponse = await fetch('http://localhost:8081/get/wuerzburg');
        if (!wurzburgResponse.ok) {
            throw new Error('Network response was not ok for Würzburg data');
        }
        const wurzburgData = await wurzburgResponse.json();
        
        // Process the data
        processCompareData(mariehamnData, wurzburgData);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function processCompareData(mariehamnData, wurzburgData) {
    // Find common dates or use all dates
    const mariehamnDates = mariehamnData.map(item => item.date);
    const wurzburgDates = wurzburgData.map(item => item.date);
    
    // Use all unique dates from both datasets
    const allDates = [...new Set([...mariehamnDates, ...wurzburgDates])].sort();
    
    // Update the labels array
    labels.length = 0;
    allDates.forEach(date => labels.push(date));
    
    // Create data arrays with matching indices
    const mariehamnTemp = [];
    const mariehamnHumidity = [];
    const mariehamnPressure = [];
    const wurzburgTemp = [];
    const wurzburgHumidity = [];
    const wurzburgPressure = [];
    
    // Fill arrays with data or null for missing dates
    allDates.forEach(date => {
        const mItem = mariehamnData.find(item => item.date === date);
        const wItem = wurzburgData.find(item => item.date === date);
        
        mariehamnTemp.push(mItem ? mItem.avg_temp_c : null);
        mariehamnHumidity.push(mItem ? mItem.avg_humidity : null);
        mariehamnPressure.push(mItem ? mItem.avg_airpressure : null);
        
        wurzburgTemp.push(wItem ? wItem.avg_temp_c : null);
        wurzburgHumidity.push(wItem ? wItem.avg_humidity : null);
        wurzburgPressure.push(wItem ? wItem.avg_airpressure : null);
    });
    
    // Update the data
    compareData.temperature.mariehamn = mariehamnTemp;
    compareData.temperature.wurzburg = wurzburgTemp;
    compareData.humidity.mariehamn = mariehamnHumidity;
    compareData.humidity.wurzburg = wurzburgHumidity;
    compareData.pressure.mariehamn = mariehamnPressure;
    compareData.pressure.wurzburg = wurzburgPressure;
    
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
fetchCompareData();
setInterval(fetchCompareData, 5000);

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
