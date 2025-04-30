const chartObject = document.getElementById('weatherChart');

      const chart = new Chart(chartObject, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March'],
          datasets: [{
            label: 'Temperature',
            data: [3, 5, 8],
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
  });