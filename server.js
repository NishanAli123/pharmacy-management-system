const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Abcd@1234', // Replace with your MySQL password
    database: 'pharmacy'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/addpharmacist.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'addpharmacist.html'));
});
app.get('/addmedicines.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'addmedicines.html'));
});
app.get('/addstock.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'addstock.html'));
});

app.get('/index.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/ordermedicine.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'ordermedicine.html'));
});
app.get('/pharmacist.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'pharmacist.html'));
});
app.get('/billing.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'billing.html'));
});


app.post('/login', (req, res) => {
    const { userId, password, role } = req.body;

    // Query to find user by user_id and role
    const sql = 'SELECT * FROM user WHERE user_id = ? AND role = ?';
    db.query(sql, [userId, role], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error', error });
        }

        // Check if user exists
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
    });
});






// Handle form submission
app.post('/add-medicine', function(req, res) {
    const { med_id, med_name, use, manufacturer } = req.body;

    const sql = "INSERT INTO medicine (med_id, med_name, med_use, manufacturer) VALUES ?";
    const values = [
        [med_id, med_name, use, manufacturer]
    ];

    db.query(sql, [values], function(error, result) {
        if (error) {
            console.error('Error inserting data:', error);
            return res.status(500).send('Error inserting data: ' + error.message);
        }
        res.send('Successfully added medicine with ID: ' + result.insertId);
    });
});




app.post('/add-stock', function(req, res) {
    const { med_id, med_name, available, shelf_location, price } = req.body;

    const sql = "INSERT INTO inventory (med_id, med_name, available, shelf_location, price) VALUES ?";
    const values = [
        [med_id, med_name, available, shelf_location, price]
    ];

    db.query(sql, [values], function(error, result) {
        if (error) {
            console.error('Error inserting data:', error);
            return res.status(500).send('Error inserting data: ' + error.message);
        }
        res.send('Successfully added to Inventory with ID: ' + result.insertId);
    });
});




// app.post('/add-pharmacist', function(req, res) {
//     const { user_id, username, password } = req.body;

//     const sql = "INSERT INTO user (user_id, username, password) VALUES ?";
//     const values = [
//         [user_id, username, password]
//     ];

//     db.query(sql, [values], function(error, result) {
//         if (error) {
//             console.error('Error inserting data:', error);
//             return res.status(500).send('Error inserting data: ' + error.message);
//         }
//         res.send('Successfully added to Pharmacist with ID: ' + user_id);
//     });
// });

app.post('/add-pharmacist', async (req, res) => {
    const { user_id, username, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // SQL query to insert the new user
        const sql = "INSERT INTO user (user_id, username, password) VALUES (?, ?, ?)";
        const values = [user_id, username, hashedPassword];

        db.query(sql, values, function(error, result) {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).send('Error inserting data: ' + error.message);
            }
            res.send('Successfully added pharmacist with ID: ' + user_id);
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Error hashing password: ' + error.message);
    }
});


app.post('/add-order', (req, res) => {
    const { o_id, s_id, med_name, quantities } = req.body;

    if (!o_id || !s_id || !Array.isArray(med_name) || !Array.isArray(quantities)) {
        return res.json({ success: false, message: 'Invalid input data' });
    }

    const insertOrder = (o_id, s_id, med_name, quantity) => {
        const query = `INSERT INTO orders (o_id, s_id, med_name, quantity, o_time) VALUES (?, ?, ?, ?, NOW())`;
        db.query(query, [o_id, s_id, med_name, quantity], (err, results) => {
            if (err) {
                console.error('Error inserting order:', err);
                return res.json({ success: false, message: 'Adding order failed.' });
            }
        });
    };

    // Insert each medicine into the database
    for (let i = 0; i < med_name.length; i++) {
        insertOrder(o_id, s_id, med_name[i], quantities[i]);
    }

    // Respond with success
    res.json({ success: true, message: 'Order placed successfully!' });
});



// app.get('/api/orders', (req, res) => {
//     const query = 'SELECT * FROM orders'; // Adjust the table name and fields as necessary
//     db.query(query, (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Database query failed' });
//         }
//         res.json(results);
//     });
// });

app.get('/api/orders', (req, res) => {
    const query = 'SELECT orders.o_id, supplier.s_name, orders.med_name, orders.quantity FROM orders JOIN supplier ON orders.s_id = supplier.s_id ORDER BY o_time DESC LIMIT 10';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Error fetching orders' });
        }
        res.json(results);
    });
});

app.get('/fetch_data', (req, res) => {
    const sql = 'SELECT medicine.med_id, medicine.med_name, medicine.med_use, inventory.available, inventory.shelf_location, inventory.price FROM inventory JOIN medicine ON inventory.med_id = medicine.med_id';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);  // Check if results contain all entries
    });
});




// API endpoint to fetch medicine details
app.get('/api/medicines/:id', (req, res) => {
    const medicineId = req.params.id;
    db.query('SELECT med_name, price, available FROM inventory WHERE med_id = ?', [medicineId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).json({ message: 'Medicine not found' });
        res.json(results[0]);
    });
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
        const saleTime = new Date().toLocaleTimeString(); // HH:mm:ss
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
    const result = await db.query('SELECT price FROM medicine WHERE med_id = ?', [medicineId]);
    if (result.length === 0) throw new Error('Medicine not found');
    return result[0].price;
}









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

