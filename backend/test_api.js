const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAPI() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Get a student user
        const [users] = await db.execute('SELECT id, name, role FROM users WHERE role = "Student" LIMIT 1');
        if (users.length === 0) {
            console.log('No student user found in DB');
            return;
        }

        const user = users[0];
        console.log(`Testing for User: ${user.name} (ID: ${user.id}, Role: ${user.role})`);

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Token generated. Calling API...');

        try {
            const res = await axios.get('http://localhost:5000/api/student/reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✔ /api/student/reports: SUCCESS', res.status);
        } catch (err) {
            console.log('❌ /api/student/reports: FAILED', err.response?.status || err.message);
            if (err.response) console.log('Response Body:', err.response.data);
        }

        try {
            const notifRes = await axios.get('http://localhost:5000/api/student/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✔ /api/student/notifications: SUCCESS', notifRes.status);
        } catch (err) {
            console.log('❌ /api/student/notifications: FAILED', err.response?.status || err.message);
            if (err.response) console.log('Response Body:', err.response.data);
        }

    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await db.end();
    }
}

testAPI();
