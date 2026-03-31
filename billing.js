let orderCount = 0;
let totalPrice = 0;
let saleIdAdded = false; // Track if sale ID field has been added



async function fetchNextSaleId() {
    try {
        const response = await fetch('/api/next-sale-id');
        const data = await response.json();
        if (data.success) {
            document.getElementById('saleId').value = data.saleId; // Set Sale ID
        } else {
            console.error('Failed to fetch Sale ID:', data.message);
        }
    } catch (error) {
        console.error('Error fetching Sale ID:', error);
    }
}

function addOrderRow() {
    // Only allow adding rows if Sale ID has been set
    if (!saleIdAdded) {
        const saleId = document.getElementById('saleId').value.trim();
        if (!saleId) {
            alert("Please enter a Sale ID first.");
            return;
        }
        saleIdAdded = true; // Mark that the Sale ID has been added
    }

    orderCount++;
    const orderRow = document.createElement('div');
    orderRow.className = 'order-row';
    orderRow.innerHTML = `
        <div class="input-group">
            <input type="text" name="medicineId_${orderCount}" placeholder="Medicine ID" required>
            <input type="number" name="quantity_${orderCount}" placeholder="Quantity" required min="1">
        </div>
        <div class="input-group">
            <input type="text" name="medicineName_${orderCount}" placeholder="Medicine Name" readonly>
            <input type="text" name="price_${orderCount}" placeholder="Price" readonly>
            <input type="text" name="total_${orderCount}" placeholder="Total" readonly>
        </div>
        <button type="button" class="btn btn-red" onclick="removeOrderRow(this)">REMOVE</button>
    `;
    document.getElementById('orderRows').appendChild(orderRow);
    calculateTotalPrice();
}

function removeOrderRow(button) {
    const orderRow = button.closest('.order-row');
    const rowTotal = parseFloat(orderRow.querySelector('input[name^="total_"]').value) || 0;
    totalPrice -= rowTotal; 
    updateTotalDisplay();
    orderRow.remove();
}

const MEDICINE_API = '/api/medicines/';
const availableQuantities = {}; // Store available quantities

// Fetch medicine details including available quantity
async function fetchMedicineDetails(medicineId, rowNumber) {
    try {
        const response = await fetch(`${MEDICINE_API}${medicineId}`);
        if (!response.ok) throw new Error('Medicine not found');

        const data = await response.json();
        updateMedicineRow(data, rowNumber);
        availableQuantities[medicineId] = data.available; // Store available quantity
    } catch (error) {
        console.error(error);
        clearMedicineRow(rowNumber);
    }
}

function updateMedicineRow(data, rowNumber) {
    document.getElementsByName(`medicineName_${rowNumber}`)[0].value = data.med_name; 
    document.getElementsByName(`price_${rowNumber}`)[0].value = parseFloat(data.price).toFixed(2); 
    updateRowTotal(rowNumber, parseFloat(data.price));
}

function clearMedicineRow(rowNumber) {
    document.getElementsByName(`medicineName_${rowNumber}`)[0].value = '';
    document.getElementsByName(`price_${rowNumber}`)[0].value = '';
    document.getElementsByName(`total_${rowNumber}`)[0].value = '';
}

function updateRowTotal(rowNumber, price) {
    const quantity = parseFloat(document.getElementsByName(`quantity_${rowNumber}`)[0].value) || 0;
    const total = quantity * price;

    document.getElementsByName(`total_${rowNumber}`)[0].value = total.toFixed(2);
    calculateTotalPrice();
}

function calculateTotalPrice() {
    totalPrice = 0;
    const totalInputs = document.querySelectorAll('input[name^="total_"]');
    totalInputs.forEach(input => {
        totalPrice += parseFloat(input.value) || 0;
    });
    updateTotalDisplay();
}

function updateTotalDisplay() {
    document.getElementById('totalPrice').innerText = `₹${totalPrice.toFixed(2)}`;
}

document.getElementById('addMore').addEventListener('click', addOrderRow);

document.getElementById('orderRows').addEventListener('keydown', function(e) {
    if (e.target.name.startsWith('medicineId_') && e.key === 'Enter') {
        const rowNumber = e.target.name.split('_')[1];
        const medicineId = e.target.value.trim();
        if (medicineId) {
            fetchMedicineDetails(medicineId, rowNumber);
        } else {
            clearMedicineRow(rowNumber);
        }
        e.preventDefault();
    }
});


// Update quantity input handling with input event for real-time updates
document.getElementById('orderRows').addEventListener('input', function(e) {
    if (e.target.name.startsWith('quantity_')) {
        const rowNumber = e.target.name.split('_')[1];
        const quantity = parseFloat(e.target.value) || 0;
        const medicineId = document.getElementsByName(`medicineId_${rowNumber}`)[0].value;
        const price = parseFloat(document.getElementsByName(`price_${rowNumber}`)[0].value) || 0;

        // Check if the entered quantity exceeds available stock
        if (availableQuantities[medicineId] && quantity > availableQuantities[medicineId]) {
            alert(`Only ${availableQuantities[medicineId]} units available in stock for this medicine.`);
            e.target.value = availableQuantities[medicineId]; // Reset to max available
        } else {
            // If valid, update total
            updateRowTotal(rowNumber, price);
        }
    }
});

// Validate Sale ID on order submission
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent form submission

    const saleId = document.getElementById('saleId').value.trim();
    if (!saleId) {
        alert("Please enter a Sale ID before placing the order.");
        return;
    }

    // Gather order data
    const medicines = [];
    for (let i = 1; i <= orderCount; i++) {
        const medicineId = document.getElementsByName(`medicineId_${i}`)[0].value;
        const medicineName = document.getElementsByName(`medicineName_${i}`)[0].value;
        const quantity = parseFloat(document.getElementsByName(`quantity_${i}`)[0].value) || 0;

        if (medicineId && medicineName && quantity > 0) {
            medicines.push({ id: medicineId, name: medicineName, quantity });
        }
    }

    // Check if all quantities are valid
    let validOrder = true;
    for (const med of medicines) {
        if (availableQuantities[med.id] && med.quantity > availableQuantities[med.id]) {
            alert(`Only ${availableQuantities[med.id]} units available in stock for medicine ID ${med.id}.`);
            validOrder = false;
            break;
        }
    }

    if (!validOrder) {
        return; // Stop submission if quantities are not valid
    }

    // Send order data to server
    const response = await fetch('/process-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ saleId, medicines })
    });

    const result = await response.json();
    if (result.success) {
        alert('Purchased successfully!');
        location.reload(); // Refresh the page after placing the order
    } else {
        alert(`Error in purchasing: ${result.message}`);
    }
});

// Initialize the first order row on page load
document.addEventListener('DOMContentLoaded', function() {
    const saleIdField = document.getElementById('saleId');
    if (saleIdField) {
        saleIdAdded = true;
    }
});


document.addEventListener('DOMContentLoaded', fetchNextSaleId);

function logout() {
    sessionStorage.clear(); // Clear any session data
    window.location.replace('index.html'); // Redirect to login page
  }