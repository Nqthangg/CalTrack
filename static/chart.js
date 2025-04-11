let caloriesChart = null;

function fetchCaloriesData() {
    console.log("Fetching calories data...");
    return fetch('/calories/month')
        .then(response => {
            if (!response.ok) {
                console.error(`Server returned ${response.status}: ${response.statusText}`);
                throw new Error(`Network response was not ok (${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data); // Debug log
            if (!Array.isArray(data)) {
                console.error("Expected array data but got:", data);
                return [];
            }
            return data;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Return empty data for error case
            return [];
        });
}

function createCaloriesChart(data) {
    console.log("Creating calories chart with data:", data);
    const canvas = document.getElementById('calories-chart');
    
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }
    
    // Clear any existing content
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateChartVisibility(data && data.length > 0);
    
    if (!data || data.length === 0) {
        return;
    }
    
    // Always destroy existing chart before creating a new one
    if (caloriesChart) {
        caloriesChart.destroy();
        caloriesChart = null;
    }
    
    try {
        // Set fixed dimensions to prevent container expansion
        canvas.style.height = '380px';
        canvas.style.maxHeight = '380px';
        
        // Create the new chart
        caloriesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item[0]),
                datasets: [{
                    label: 'Net Calories',
                    data: data.map(item => item[1]),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 3,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Important to prevent container resizing
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Daily Net Calories'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Calories (kcal)'
                        },
                        beginAtZero: true // Start from zero for clearer representation
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                animation: {
                    duration: 1000, // Smoother animation
                    easing: 'easeOutQuart'
                }
            }
        });
        
        // Store the chart in the window object for access in other scripts
        window.caloriesChart = caloriesChart;
    } catch (error) {
        console.error("Error creating chart:", error);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#f00';
        ctx.textAlign = 'center';
        ctx.fillText('Error creating chart', canvas.width/2, canvas.height/2);
    }
}

// Function to update chart visibility based on data availability
function updateChartVisibility(hasData) {
    const canvas = document.getElementById('calories-chart');
    const noDataMessage = document.getElementById('no-data-message');
    
    if (!canvas || !noDataMessage) return;
    
    if (hasData) {
        canvas.style.display = 'block';
        noDataMessage.style.display = 'none';
    } else {
        canvas.style.display = 'none';
        noDataMessage.style.display = 'block';
    }
}

// Function to initialize the calories chart
function initializeCaloriesChart() {
    console.log("Initializing calories chart...");
    
    // Set up the chart container first
    const canvas = document.getElementById('calories-chart');
    if (canvas) {
        // Find or create a chart container div
        let chartContainer = canvas.closest('.chart-container');
        
        if (!chartContainer && canvas.parentElement) {
            // Wrap the canvas in a chart container if it doesn't exist
            chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            chartContainer.style.height = '400px';
            chartContainer.style.maxHeight = '400px';
            chartContainer.style.position = 'relative';
            
            // Replace the canvas with the container and put the canvas inside
            const parent = canvas.parentElement;
            parent.insertBefore(chartContainer, canvas);
            chartContainer.appendChild(canvas);
        }
        
        // Set canvas dimensions
        canvas.style.height = '380px';
        canvas.style.maxHeight = '380px';
    }
    
    // Fetch data and create chart
    fetchCaloriesData()
        .then(data => {
            createCaloriesChart(data);
        })
        .catch(error => {
            console.error("Error initializing chart:", error);
            updateChartVisibility(false);
        });
}

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Remove any duplicate chart canvases first
    const chartCanvases = document.querySelectorAll('#calories-chart');
    if (chartCanvases.length > 1) {
        for (let i = 1; i < chartCanvases.length; i++) {
            if (chartCanvases[i] && chartCanvases[i].parentNode) {
                chartCanvases[i].parentNode.removeChild(chartCanvases[i]);
            }
        }
    }
    
    // Initialize the chart
    initializeCaloriesChart();
    
    // Re-initialize on window resize to maintain proper dimensions
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (caloriesChart) {
                caloriesChart.resize();
            }
        }, 200);
    });
});

// Export functions for use in other files
window.createCaloriesChart = createCaloriesChart;
window.fetchCaloriesData = fetchCaloriesData;
window.initializeCaloriesChart = initializeCaloriesChart;