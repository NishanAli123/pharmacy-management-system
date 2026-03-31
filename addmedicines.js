document.querySelector('.ph').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/add-medicine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const message = await response.text();
            alert(message); // Show success message
        } else {
            const errorMessage = await response.text();
            alert(errorMessage); // Show error message if medicine exists
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }