document.querySelector('.ph').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission behavior

  const userId = document.getElementById('user_id').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Check which button was clicked
  const buttonClicked = event.submitter.id;

  if (buttonClicked === 'removeBtn') {
      // Handle REMOVE functionality
      const response = await fetch('/remove-pharmacist', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, username, password }),
      });

      const result = await response.json();
      alert(result.message);
  } else {
      // Handle ADD functionality
      const response = await fetch('/add-pharmacist', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, username, password }),
      });

      const result = await response.text();
      alert(result); // Show the server response
  }
  event.target.reset();
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }