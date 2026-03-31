const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('./db'); // Import the database connection
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/addpharmacist.html', (req, res) => res.sendFile(path.join(__dirname, 'addpharmacist.html')));
app.get('/addmedicines.html', (req, res) => res.sendFile(path.join(__dirname, 'addmedicines.html')));
app.get('/addstock.html', (req, res) => res.sendFile(path.join(__dirname, 'addstock.html')));
app.get('/ordermedicine.html', (req, res) => res.sendFile(path.join(__dirname, 'ordermedicine.html')));
app.get('/pharmacist.html', (req, res) => res.sendFile(path.join(__dirname, 'pharmacist.html')));
app.get('/billing.html', (req, res) => res.sendFile(path.join(__dirname, 'billing.html')));
app.get('/notification.html', (req, res) => res.sendFile(path.join(__dirname, 'notification.html')));
app.get('/regularcustomer.html', (req, res) => res.sendFile(path.join(__dirname, 'regularcustomer.html')));
app.get('/rc1.html', (req, res) => res.sendFile(path.join(__dirname, 'rc1.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/viewmedicine.html', (req, res) => res.sendFile(path.join(__dirname, 'viewmedicine.html')));




app.post('/login', async (req, res) => {
    const { userId, password, role } = req.body;

    // Query to find user by user_id and role
    const sql = 'SELECT * FROM user WHERE user_id = ? AND role = ?';
    try {
        const [results] = await db.query(sql, [userId, role]);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare password
        if (bcrypt.compareSync(password, user.password)) {
            return res.status(200).json({ message: 'Login successful', role: user.role });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Database error', error });
    }
});

// Handle form submission to add medicine
app.post('/add-medicine', async (req, res) => {
    const { med_id, med_name, use, manufacturer } = req.body;

    // Check if the medicine already exists
    const checkSql = "SELECT * FROM medicine WHERE med_id = ?";
    try {
        const [existingMedicine] = await db.query(checkSql, [med_id]);

        if (existingMedicine.length > 0) {
            return res.status(409).send('Medicine with this ID already exists.');
        }

        // Proceed to insert if it doesn't exist
        const sql = "INSERT INTO medicine (med_id, med_name, med_use, manufacturer) VALUES (?, ?, ?, ?)";
        const [result] = await db.query(sql, [med_id, med_name, use, manufacturer]);
        res.send('Successfully added medicine with ID: ' + med_id);
    } catch (error) {
        console.error('Error inserting data:', error);
        return res.status(500).send('Error inserting data: ' + error.message);
    }
});





app.get('/check-medicine-inventory/:med_id', async (req, res) => {
    const medId = req.params.med_id;

    try {
        const [medicine] = await db.query("SELECT m.med_name, i.shelf_location, i.price FROM medicine m LEFT JOIN inventory i ON m.med_id = i.med_id WHERE m.med_id = ?", [medId]);

        if (medicine.length > 0) {
            return res.json(medicine[0]); // Return the medicine details
        } else {
            return res.status(404).send('Medicine not found');
        }
    } catch (error) {
        console.error('Error fetching medicine:', error);
        return res.status(500).send('Error: ' + error.message);
    }
});




app.get('/check-medicine/:med_id', async (req, res) => {
    const medId = req.params.med_id;

    try {
        const [medicine] = await db.query("SELECT med_name FROM medicine WHERE med_id = ?", [medId]);

        if (medicine.length > 0) {
            return res.json(medicine[0]); // Return the medicine name
        } else {
            return res.status(404).send('Medicine not found');
        }
    } catch (error) {
        console.error('Error fetching medicine:', error);
        return res.status(500).send('Error: ' + error.message);
    }
});





app.post('/add-stock', async (req, res) => {
    const { med_id, med_name, available, shelf_location, price } = req.body;

    try {
        // Check if the med_id already exists in the inventory
        const [existingMed] = await db.query("SELECT * FROM inventory WHERE med_id = ?", [med_id]);

        if (existingMed.length > 0) {
            // If it exists, update the available quantity
            const updateSql = "UPDATE inventory SET available = available + ?, shelf_location = ?, price = ? WHERE med_id = ?";
            await db.query(updateSql, [available, shelf_location, price, med_id]);

            return res.json({
                message: `Successfully updated inventory for Medicine ID: ${med_id}. Newly added stock: ${available}`
            });
        } else {
            // If it doesn't exist, insert a new record
            const insertSql = "INSERT INTO inventory (med_id, med_name, available, shelf_location, price) VALUES (?, ?, ?, ?, ?)";
            const [result] = await db.query(insertSql, [med_id, med_name, available, shelf_location, price]);

            return res.json({
                message: 'Successfully added to Inventory with ID: ' + med_id
            });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ message: 'Error: ' + error.message });
    }
});





// Route for adding a pharmacist
app.post('/add-pharmacist', async (req, res) => {
    const { user_id, username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO user (user_id, username, password) VALUES (?, ?, ?)";
        const values = [user_id, username, hashedPassword];

        const [result] = await db.query(sql, values);
        res.send('Successfully added pharmacist with ID: ' + user_id);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error: ' + error.message);
    }
});




// Route for removing a pharmacist
app.post('/remove-pharmacist', async (req, res) => {
    const { user_id, username, password } = req.body;

    try {
        // Find the user
        const sql = "SELECT * FROM user WHERE user_id = ? AND username = ?";
        const [rows] = await db.query(sql, [user_id, username]);

        if (rows.length > 0) {
            // Compare hashed password
            const match = await bcrypt.compare(password, rows[0].password);
            if (match) {
                // Delete the user
                const deleteSql = "DELETE FROM user WHERE user_id = ?";
                await db.query(deleteSql, [user_id]);
                return res.json({ message: 'Successfully removed pharmacist with ID: ' + user_id });
            } else {
                return res.json({ message: 'Password does not match.' });
            }
        } else {
            return res.json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error: ' + error.message });
    }
});




// Handle form submission to add order
app.post('/add-order', async (req, res) => {
    const { o_id, s_id, med_name, quantities } = req.body;

    if (!o_id || !s_id || !Array.isArray(med_name) || !Array.isArray(quantities)) {
        return res.json({ success: false, message: 'Invalid input data' });
    }

    try {
        // Insert each medicine into the database
        for (let i = 0; i < med_name.length; i++) {
            const query = `INSERT INTO orders (o_id, s_id, med_name, quantity, o_time) VALUES (?, ?, ?, ?, NOW())`;
            await db.query(query, [o_id, s_id, med_name[i], quantities[i]]);
        }

        // Respond with success
        res.json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error('Error inserting order:', error);
        res.json({ success: false, message: 'Adding order failed.' });
    }
});

app.get('/next-order-id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT MAX(o_id) AS maxId FROM orders'); // Replace 'orders' with your actual table name
        const nextOrderId = rows[0].maxId ? rows[0].maxId + 1 : 3000; // Increment max ID or start from 1 if no orders exist
        res.json({ nextOrderId });
    } catch (error) {
        console.error('Error fetching next order ID:', error);
        res.status(500).json({ message: 'Error fetching next order ID' });
    }
});





// Fetch the latest orders
app.get('/api/orders', async (req, res) => {
    const query = 'SELECT orders.o_id, supplier.s_name, orders.med_name, orders.quantity FROM orders JOIN supplier ON orders.s_id = supplier.s_id ORDER BY o_time DESC LIMIT 10';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Error fetching orders' });
    }
});




// Fetch medicine details
app.get('/fetch_data', async (req, res) => {
    const sql = 'SELECT medicine.med_id, medicine.med_name, medicine.med_use, inventory.available, inventory.shelf_location, inventory.price FROM inventory JOIN medicine ON inventory.med_id = medicine.med_id';
    try {
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});






// Fetch medicine details by ID
app.get('/api/medicines/:id', async (req, res) => {
    const medicineId = req.params.id;
    try {
        const [results] = await db.query('SELECT med_name, price, available FROM inventory WHERE med_id = ?', [medicineId]);
        if (results.length === 0) return res.status(404).json({ message: 'Medicine not found' });
        res.json(results[0]);
    } catch (err) {
        return res.status(500).send(err);
    }
});





app.get('/api/next-sale-id', async (req, res) => {
    try {
        const [result] = await db.query('SELECT COALESCE(MAX(sale_id), 1999) + 1 AS nextSaleId FROM sales');
        const nextSaleId = result[0].nextSaleId;
        
        // Optionally, you can also save this Sale ID if required in your application logic.

        res.json({ success: true, saleId: nextSaleId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error fetching Sale ID' });
    }
});





// Process order and update sales and inventory
app.post('/process-order', async (req, res) => {
    const { saleId, medicines } = req.body;

    // Validate input
    if (!saleId || !Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid order data.' });
    }

    let totalOrderPrice = 0;

    try {
        // Insert each medicine order into the sales table
        for (const med of medicines) {
            const { id: medicineId, name: medicineName, quantity } = med;

            // Calculate price for this medicine
            const price = await getMedicinePrice(medicineId); // Fetch price from database
            const totalPrice = price * quantity;
            totalOrderPrice += totalPrice;

            // Insert into sales table
            await db.query('INSERT INTO sales (sale_id, med_id, med_name, quantity, price) VALUES (?, ?, ?, ?, ?)', [
                saleId,
                medicineId,
                medicineName,
                quantity,
                totalPrice
            ]);

            // Update inventory
            await db.query('UPDATE inventory SET available = available - ? WHERE med_id = ?', [
                quantity,
                medicineId
            ]);
        }

        // Insert into sales_history table
        const saleDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const saleTime = new Date().toTimeString().split(' ')[0]; // HH:mm:ss format
        await db.query('INSERT INTO sales_history (sale_id, sale_date, sale_time, total_price) VALUES (?, ?, ?, ?)', [
            saleId,
            saleDate,
            saleTime,
            totalOrderPrice
        ]);

        return res.json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error processing order.' });
    }
});





// Helper function to fetch medicine price from database
async function getMedicinePrice(medicineId) {
    const [result] = await db.query('SELECT price FROM inventory WHERE med_id = ?', [medicineId]);
    if (result.length === 0) throw new Error('Medicine not found');
    return result[0].price;
}




app.get('/api/notifications', async (req, res) => {
    try {
        const [results] = await db.query('SELECT med_id, med_name, message, created_at FROM inventory_notifications');
        res.json(results);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});




app.delete('/clear-notifications', async (req, res) => {
    try {
        await db.query("TRUNCATE TABLE inventory_notifications");
        return res.status(200).send("Notifications cleared successfully.");
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return res.status(500).send('Error: ' + error.message);
    }
});








// Fetch medicine details by ID
app.get('/api/new-medicines/:id', async (req, res) => {
    const medicineId = req.params.id;
    try {
        const [results] = await db.query('SELECT med_name, price, available FROM inventory WHERE med_id = ?', [medicineId]);
        if (results.length === 0) return res.status(404).json({ message: 'Medicine not found' });
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).send(err);
    }
});

// Get the next Sale ID and Customer ID
app.get('/api/new-next-ids', async (req, res) => {
    try {
        const [saleResults] = await db.query('SELECT COALESCE(MAX(sale_id), 1999) + 1 AS nextSaleId FROM sales');

        res.json({
            success: true,
            ids: {
                saleId: saleResults[0].nextSaleId,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error fetching IDs' });
    }
});






// Process order and update sales and inventory
app.post('/new-process-order', async (req, res) => {
    const { saleId, medicines } = req.body;

    // Validate input
    if (!saleId || !Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid order data.' });
    }

    let totalOrderPrice = 0;

    try {
        // Insert each medicine order into the sales table
        for (const med of medicines) {
            const { id: medicineId, name: medicineName, quantity } = med;

            // Fetch price and validate availability
            const price = await getMedicinePrice(medicineId);
            if (quantity > await getAvailableQuantity(medicineId)) {
                return res.status(400).json({ success: false, message: `Insufficient stock for medicine ID ${medicineId}` });
            }

            const totalPrice = price * quantity;
            totalOrderPrice += totalPrice;
            const newTotalPrice = totalPrice * 0.95;

            // Insert into sales table
            await db.query('INSERT INTO sales (sale_id, med_id, med_name, quantity, price) VALUES (?, ?, ?, ?, ?)', [
                saleId,
                medicineId,
                medicineName,
                quantity,
                newTotalPrice
            ]);

            // Update inventory
            await db.query('UPDATE inventory SET available = available - ? WHERE med_id = ?', [
                quantity,
                medicineId
            ]);
        }


        const discountedTotalPrice = totalOrderPrice * 0.95;
        // Insert into sales_history table
        const saleDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const saleTime = new Date().toTimeString().split(' ')[0]; // HH:mm:ss format
        await db.query('INSERT INTO sales_history (sale_id, sale_date, sale_time, total_price) VALUES (?, ?, ?, ?)', [
            saleId,
            saleDate,
            saleTime,
            discountedTotalPrice
        ]);

        return res.json({ success: true, message: 'Purchased successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error processing purchase.' });
    }
});




// Helper function to fetch medicine price from database
async function getMedicinePrice(medicineId) {
    const [result] = await db.query('SELECT price FROM inventory WHERE med_id = ?', [medicineId]);
    if (result.length === 0) throw new Error('Medicine not found');
    return result[0].price;
}

// Helper function to get available quantity of a medicine
async function getAvailableQuantity(medicineId) {
    const [result] = await db.query('SELECT available FROM inventory WHERE med_id = ?', [medicineId]);
    if (result.length === 0) throw new Error('Medicine not found');
    return result[0].available;
}






app.get('/api/highest-customer-id', async (req, res) => {
    try {
        const [results] = await db.query('SELECT MAX(c_id) AS maxId FROM customer');
        res.json({ success: true, maxId: results[0].maxId || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});




// Insert new customer details
app.post('/add-customer', async (req, res) => {
    const { c_id, c_name, age, pnumber } = req.body;

    try {
        const query = 'INSERT INTO customer (c_id, c_name, age, pnumber) VALUES (?, ?, ?, ?)';
        await db.query(query, [c_id, c_name, age, pnumber]);
        res.json({ success: true, message: 'Customer added successfully!' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});





// Assuming you have a MySQL connection established
app.get('/api/recent-customers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT c_name, pnumber FROM customer ORDER BY c_id DESC LIMIT 10'); // Fetch latest 5 customers
        res.json({ success: true, customers: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});





// Route to get earnings and sales count
app.get('/dashboard-data', async (req, res) => {
    try {
        // Fetch total earnings
        const [earningsResult] = await db.query('SELECT SUM(price) AS totalEarnings FROM sales');
        const totalEarnings = earningsResult[0]?.totalEarnings || 0;

        // Fetch total sales count
        const [salesCountResult] = await db.query('SELECT COUNT(sale_id) AS totalSales FROM sales_history');
        const totalSales = salesCountResult[0]?.totalSales || 0;

        res.json({ totalEarnings, totalSales });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});











// Serve static files (CSS, JS)
app.get('/*.css', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/*.js', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
