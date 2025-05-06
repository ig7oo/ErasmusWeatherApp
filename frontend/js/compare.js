let currentChart = null;

const data = {
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
                    label: `Mariehamn ${data[type].label}`,
                    data: data[type].mariehamn,
                    borderColor: '#ff6384',
                    tension: 0.1
                },
                {
                    label: `Würzburg ${data[type].label}`,
                    data: data[type].wurzburg,
                    borderColor: '#36a2eb',
                    tension: 0.1
                }
            ]
        }
    });
}

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
