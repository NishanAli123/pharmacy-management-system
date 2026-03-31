document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search input');
    const tbody = document.querySelector('tbody');
    let allData = []; // Store all data to filter later

    // Function to fetch and display data
    function fetchData() {
        fetch('http://localhost:3000/fetch_data')
            .then(response => response.json())
            .then(data => {
                allData = data; // Store all data
                displayData(allData); // Display all data initially
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to display data in the table
    function displayData(data) {
        tbody.innerHTML = ''; // Clear existing content

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.med_id}</td>
                <td>${item.med_name}</td>
                <td>${item.med_use}</td>
                <td>${item.available}</td>
                <td>${item.shelf_location}</td>
                <td>${item.price}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Fetch initial data
    fetchData();

    // Add search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();

        // Filter data based on search input
        const filteredData = allData.filter(item => 
            item.med_name.toLowerCase().includes(searchTerm)
        );

        // Display filtered data or clear the table if nothing matches
        if (filteredData.length > 0) {
            displayData(filteredData);
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
        }
    });
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }