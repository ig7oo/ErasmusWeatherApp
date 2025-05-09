document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch data from your API for Würzburg (Germany)
    const response = await fetch('http://localhost:8081/get/wuerzburg');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const weatherData = await response.json();
    
    // Process the data for charts
    const labels = weatherData.map(item => item.date);
    const temperatureValues = weatherData.map(item => item.avg_temp_c);
    const humidityValues = weatherData.map(item => item.avg_humidity);
    const pressureValues = weatherData.map(item => item.avg_airpressure);
    
    // Create temperature chart
    new Chart(document.getElementById('temperatureChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatureValues,
          borderColor: '#ff6384',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    // Create humidity chart
    new Chart(document.getElementById('humidityChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Humidity (%)',
          data: humidityValues,
          borderColor: '#36a2eb',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Humidity (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    // Create pressure chart
    new Chart(document.getElementById('pressureChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pressure (hPa)',
          data: pressureValues,
          borderColor: '#4bc0c0',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Pressure (hPa)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    document.getElementById('errorMessage').textContent = 
      'Failed to load weather data. Please try again later.';
  }
});
