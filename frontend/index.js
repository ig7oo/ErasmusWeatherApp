// Dummy data
const temperatureData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [2, 4, 8, 12, 18, 22]
};

const humidityData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [85, 80, 75, 70, 65, 60]
};

const pressureData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [1013, 1015, 1012, 1010, 1014, 1016]
};

// Create charts
new Chart(document.getElementById('temperatureChart'), {
  type: 'line',
  data: {
      labels: temperatureData.labels,
      datasets: [{
          label: 'Temperature (°C)',
          data: temperatureData.values,
          borderColor: '#ff6384',
          tension: 0.1
      }]
  }
});

new Chart(document.getElementById('humidityChart'), {
  type: 'line',
  data: {
      labels: humidityData.labels,
      datasets: [{
          label: 'Humidity (%)',
          data: humidityData.values,
          borderColor: '#36a2eb',
          tension: 0.1
      }]
  }
});

new Chart(document.getElementById('pressureChart'), {
  type: 'line',
  data: {
      labels: pressureData.labels,
      datasets: [{
          label: 'Pressure (hPa)',
          data: pressureData.values,
          borderColor: '#4bc0c0',
          tension: 0.1
      }]
  }
});
