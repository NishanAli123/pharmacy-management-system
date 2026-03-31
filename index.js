const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});


async function navigateTo(idField, passwordField, role) {
    const id = document.getElementById(idField).value;
    const password = document.getElementById(passwordField).value;

    if (id === '' || password === '') {
        alert('Please enter both ID and Password');
        return;
    }

    // Make a POST request to the login endpoint
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: id, password: password, role: role }),
        });

        const data = await response.json();

        if (response.ok) {
            // Redirect based on role
            if (role === 'admin') {
                window.location.href = 'dashboard.html';
            } else if (role === 'pharmacist') {
                window.location.href = 'pharmacist.html';
            }
        } else {
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please try again.');
    }
}

// Adding event listeners for the login buttons
document.getElementById('adminLoginBtn').addEventListener('click', () => {
    navigateTo('adminID', 'adminPassword', 'admin');
});

document.getElementById('pharmacistLoginBtn').addEventListener('click', () => {
    navigateTo('pharmacistID', 'pharmacistPassword', 'pharmacist');
});

document.getElementById('login').addEventListener('click', function() {
    // Change the background color to a random color
    document.body.style.background = 'linear-gradient(to right, #e2e2e2, #c9d6ff)';
});

document.getElementById('register').addEventListener('click', function() {
    // Change the background color to a random color
    document.body.style.background = 'linear-gradient(to right, #e2e2e2, #ffc9c9)';
    document.getElementById('pharmacistLoginBtn').style.backgroundColor = '#a82d2d'
});

