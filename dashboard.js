// Add hovered class to selected list item
const list = document.querySelectorAll(".navigation li");

function activeLink(event) {
  list.forEach(item => item.classList.remove("hovered"));
  event.currentTarget.classList.add("hovered");
}

list.forEach(item => item.addEventListener("mouseover", activeLink));

// Menu Toggle
const toggle = document.querySelector(".toggle");
const navigation = document.querySelector(".navigation");
const main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

// dashboard.js
async function loadOrders() {
  try {
    const response = await fetch('http://localhost:3000/api/orders');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const orders = await response.json();
    populateOrdersTable(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    // Optionally, display an error message to the user
    document.querySelector('.error-message').textContent = 'Failed to load orders. Please try again later.';
  }
}

function populateOrdersTable(orders) {
  const tableBody = document.querySelector('.recentOrders tbody');
  tableBody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.o_id}</td>
      <td>${order.s_name}</td>
      <td>${order.med_name}</td>
      <td>${order.quantity}</td>
    </tr>
  `).join('');
}

window.onload = loadOrders;

async function fetchRecentCustomers() {
  try {
      const response = await fetch('/api/recent-customers');
      const result = await response.json();
      if (result.success) {
          const customerList = document.querySelector('.customerList');
          customerList.innerHTML = ''; // Clear existing entries

          result.customers.forEach(customer => {
              const customerDiv = document.createElement('div');
              customerDiv.className = 'customer';
              customerDiv.innerHTML = `
                  <div class="customerName">${customer.c_name}</div>
                  <div class="customerPhone">${customer.pnumber}</div>
              `;
              customerList.appendChild(customerDiv);
          });
      } else {
          console.error('Failed to fetch recent customers:', result.message);
      }
  } catch (error) {
      console.error('Error fetching recent customers:', error);
  }
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchRecentCustomers);

document.addEventListener('DOMContentLoaded', async () => {
  try {
      const response = await fetch('/dashboard-data');
      const data = await response.json();

      // Update the Sales card
      const salesCard = document.querySelector('.card.sales .numbers');
      salesCard.textContent = data.totalSales;

      // Update the Earnings card
      const earningsCard = document.querySelector('.card.earnings .numbers');
      earningsCard.textContent = `₹${data.totalEarnings.toFixed(2)}`;
  } catch (error) {
      console.error('Error fetching dashboard data:', error);
  }
});



function logout() {
  sessionStorage.clear(); // Clear any session data
  window.location.replace('index.html'); // Redirect to login page
}