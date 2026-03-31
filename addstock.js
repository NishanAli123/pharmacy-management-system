document.addEventListener("DOMContentLoaded", () => {
    const medIdInput = document.getElementById("med_id");
    const medNameInput = document.getElementById("med_name");
    const shelfLocationInput = document.getElementById("shelf_location");
    const priceInput = document.getElementById("price");

    medIdInput.addEventListener("change", async () => {
        const medId = medIdInput.value;

        try {
            // First, check if the medicine exists in both tables
            let response = await fetch(`/check-medicine-inventory/${medId}`);
            if (response.ok) {
                const medicineData = await response.json();
                if (medicineData) {
                    // Populate the fields if medicine exists in inventory
                    medNameInput.value = medicineData.med_name;
                    shelfLocationInput.value = medicineData.shelf_location || '';
                    priceInput.value = medicineData.price || '';
                    return; // Exit since we've found the medicine
                }
            }

            // If not found in inventory, check only in the medicine table
            response = await fetch(`/check-medicine/${medId}`);
            if (response.ok) {
                const medicineData = await response.json();
                if (medicineData) {
                    // Populate med_name only
                    medNameInput.value = medicineData.med_name;
                    shelfLocationInput.value = '';
                    priceInput.value = '';
                } else {
                    // Clear fields if no medicine found
                    medNameInput.value = '';
                    shelfLocationInput.value = '';
                    priceInput.value = '';
                    alert("No medicine found with this ID.");
                }
            } else {
                alert("Error fetching medicine details.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred while fetching medicine details.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector('.ph'); // Select your form

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/add-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message); // Show the success message after insertion/updation
                form.reset(); // Clear the form fields
            } else {
                alert("Error: " + result.message); // Show an error message if something went wrong
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred while adding stock.");
        }
    });
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }