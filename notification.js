document.addEventListener('DOMContentLoaded', () => {
    const notificationsSearchInput = document.querySelector('.notifications-search input'); // New search input for notifications
    const notificationsTbody = document.querySelector('tbody'); // Select tbody for notifications
    let allNotifications = []; // Store all notifications

    // Function to fetch and display data for inventory notifications
    function fetchNotifications() {
        fetch('http://localhost:3000/api/notifications') // Adjust the endpoint as needed
            .then(response => response.json())
            .then(data => {
                allNotifications = data; // Store all notifications
                displayNotifications(allNotifications); // Display all notifications initially
            })
            .catch(error => console.error('Error fetching notifications:', error));
    }

    // Function to display notifications in the notifications table
    function displayNotifications(data) {
        notificationsTbody.innerHTML = ''; // Clear existing content

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.med_id}</td>
                <td>${item.med_name}</td>
                <td>${item.message}</td>
                <td>${new Date(item.created_at).toLocaleString()}</td> <!-- Format date -->
            `;
            notificationsTbody.appendChild(row);
        });
    }

    // Fetch initial notifications data
    fetchNotifications(); // Fetch notifications on page load

    // Add search functionality for notifications
    notificationsSearchInput.addEventListener('input', () => {
        const searchTerm = notificationsSearchInput.value.toLowerCase();

        // Filter notifications based on search input
        const filteredNotifications = allNotifications.filter(item => 
            item.med_name.toLowerCase().includes(searchTerm)
        );

        // Display filtered notifications or clear the table if nothing matches
        if (filteredNotifications.length > 0) {
            displayNotifications(filteredNotifications);
        } else {
            notificationsTbody.innerHTML = '<tr><td colspan="4">No results found</td></tr>';
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const clearAllButton = document.getElementById("remove_all");

    clearAllButton.addEventListener("click", async () => {
        const confirmation = confirm("Are you sure you want to clear all notifications?");
        if (confirmation) {
            try {
                const response = await fetch('/clear-notifications', { method: 'DELETE' });
                if (response.ok) {
                    alert("All notifications have been cleared.");
                    // Refresh the page after clearing notifications
                    location.reload();
                } else {
                    alert("Error clearing notifications.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("An error occurred while clearing notifications.");
            }
        }
    });
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }