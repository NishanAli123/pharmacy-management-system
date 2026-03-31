document.addEventListener("DOMContentLoaded", () => {
    const orderForm = document.getElementById("orderForm");
    const medContainer = document.getElementById("medicineContainer");

    // Function to fetch the next order ID
    const fetchNextOrderId = async () => {
        try {
            const response = await fetch('/next-order-id');
            const data = await response.json();
            document.getElementById("o_id").value = data.nextOrderId; // Set the fetched ID to the input field
        } catch (error) {
            console.error('Error fetching next order ID:', error);
            alert('Failed to fetch next order ID.');
        }
    };

    // Call the function to fetch next order ID on page load
    fetchNextOrderId();

    // Function to add a new medicine entry
    const addMedicineEntry = () => {
        const medicineEntry = document.createElement("div");
        medicineEntry.className = "medicineEntry";
        medicineEntry.innerHTML = `
            <input type="text" name="med_name[]" placeholder="Medicine Name" required>
            <input type="number" name="quantity[]" placeholder="Quantity" required>
            <button type="button" class="removeMedicine">Remove</button>
        `;
        medContainer.appendChild(medicineEntry);

        // Add event listener to the remove button
        medicineEntry.querySelector(".removeMedicine").addEventListener("click", () => {
            medContainer.removeChild(medicineEntry);
        });
    };

    // Event listener for the "Add more" button
    document.getElementById("addMedicine").addEventListener("click", addMedicineEntry);

    // Handle form submission
    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(orderForm);
        const data = {
            o_id: formData.get("o_id"),
            s_id: formData.get("s_id"),
            med_name: formData.getAll("med_name[]"),
            quantities: formData.getAll("quantity[]")
        };

        try {
            const response = await fetch('/add-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                orderForm.reset(); // Clear the form
                fetchNextOrderId(); // Fetch new order ID
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to place order.');
        }
    });
});

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }