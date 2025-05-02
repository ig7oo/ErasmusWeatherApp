window.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('dateFormContainer');
  
    renderForm(formContainer);
  
    formContainer.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const city = document.getElementById('city').value;
      const start = document.getElementById('startDate').value;
      const end = document.getElementById('endDate').value;
  
      try {
        const response = await fetch(`http://localhost:8081/get/${city}/${start}/${end}`);
        const data = await response.json();
  
        fillForm(data, city);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    });
  });
  
  function renderForm(formContainer) {
    formContainer.innerHTML = `
      <h3>Select weather data from a specific timespan</h3>
      <div style="width:20%;">
        <form id="dateRangeForm">
          <label>
            City:
            <select id="city" name="city" required>
              <option value="wuerzburg">Würzburg</option>
              <option value="mariehamn">Mariehamn</option>
            </select>
          </label><br>
          
          <label>
            Start Date: <input type="date" id="startDate" name="startDate" required>
          </label><br>
  
          <label>
            End Date: <input type="date" id="endDate" name="endDate" required>
          </label><br>
  
          <button type="submit">Confirm</button>
        </form>
      </div>
    `;
  }
  
  function fillForm(data, city) {
    const formContainer = document.getElementById('dateFormContainer');
    formContainer.innerHTML = '';
  
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  
    // Create title
    const title = document.createElement('h3');
    title.textContent = `Weather ${formattedCity}`;
    formContainer.appendChild(title);
  
    // Container div with fixed width
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '20%';
  
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = `weatherChart${formattedCity}`;
    canvas.width = 200;
    canvas.height = 200;
  
    chartContainer.appendChild(canvas);
    formContainer.appendChild(chartContainer);
  
    // Add back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.style.marginTop = '10px';
    backButton.addEventListener('click', () => renderForm(formContainer));
    formContainer.appendChild(backButton);
  
    // Prepare data
    const xLabels = data.map(entry => entry.date);
    const tempDataC = data.map(entry => entry.avg_temp_c);
    const tempDataF = data.map(entry => entry.avg_temp_f);
    const humidityData = data.map(entry => entry.avg_humidity);
  
    // Render chart
    new Chart(canvas, {
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
            label: 'Humidity (%)',
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
  }
  