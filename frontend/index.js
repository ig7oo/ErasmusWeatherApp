
const chartObject = document.getElementById('weatherChart');

fetch('http://localhost:8081/index.php')
  .then(response => response.json())
  .then(data => {
    const xLabels = data.map(entry => entry.date);
    const tempDataC = data.map(entry => entry.avg_temp_c);
    const tempDataF = data.map(entry => entry.avg_temp_f);
    const humidityData = data.map (entry => entry.avg_humidity)

    const chart = new Chart(chartObject, {
      type: 'line',
      data: {
        labels: xLabels,
        datasets: [
          {
          label: 'Temp (°C)',
          data: tempDataC,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
          },
          {
            label: 'Temp (°F)',
            data: tempDataF,
            borderColor: 'rgb(167, 59, 26)',
            tension: 0.1
            },
          {
            label: 'humidity (%)',
            data: humidityData,
            borderColor: 'rgb(26, 59, 167)',
            tension: 0.1
            },

        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  })
  .catch(error => {
    console.error('Failed to fetch weather data:', error);
  });
