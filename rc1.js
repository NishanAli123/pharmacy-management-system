// async function fetchHighestCustomerId() {
//         try {
//             const response = await fetch('/api/highest-customer-id');
//             const result = await response.json();
//             if (result.success) {
//                 document.getElementById('c_id').value = result.maxId + 1; // Increment the maxId for new entry
//             } else {
//                 console.error('Failed to fetch highest customer ID:', result.message);
//             }
//         } catch (error) {
//             console.error('Error fetching highest customer ID:', error);
//         }
//     }

//     document.addEventListener('DOMContentLoaded', fetchHighestCustomerId);

//     // Handle form submission
//     document.getElementById('customerForm').addEventListener('submit', async function (e) {
//         e.preventDefault(); // Prevent default form submission

//         const formData = new FormData(this);
//         const data = Object.fromEntries(formData.entries());

//         try {
//             const response = await fetch('/add-customer', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(data)
//             });

//             const result = await response.json();
//             if (result.success) {
//                 alert('Customer added successfully!');
//                 location.reload(); // Refresh the page
//             } else {
//                 alert(`Error: ${result.message}`);
//             }
//         } catch (error) {
//             console.error('Error adding customer:', error);
//             alert('An error occurred while adding the customer.');
//         }
//     });

async function fetchHighestCustomerId() {
    try {
        const response = await fetch('/api/highest-customer-id');
        const result = await response.json();
        if (result.success) {
            document.getElementById('c_id').value = result.maxId + 1; // Increment the maxId for new entry
        } else {
            console.error('Failed to fetch highest customer ID:', result.message);
        }
    } catch (error) {
        console.error('Error fetching highest customer ID:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchHighestCustomerId);

// Handle form submission
document.getElementById('customerForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // Optional: Show loading indication
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the button

    try {
        const response = await fetch('/add-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('Customer added successfully!'); // Show success message
            location.reload(); // Refresh the page
        } else {
            // Display specific validation errors if available
            const errorMessage = result.errors ? result.errors.map(err => err.msg).join(', ') : result.message;
            alert(`Error: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        alert('An unexpected error occurred while adding the customer.');
    } finally {
        // Re-enable the button
        submitButton.disabled = false;
    }
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }