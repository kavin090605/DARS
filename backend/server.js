const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
app.use(cors({
    origin: ['https://dars-e5tt.vercel.app', process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// Simple Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);

// TEMPORARY: Database Import Route (Delete after successful deployment)
app.post('/api/auth/temp-import', async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const db = require('./config/db');
    const sqlPath = path.join(__dirname, 'dars_db.sql');

    if (!fs.existsSync(sqlPath)) {
        return res.status(404).json({ message: 'dars_db.sql not found in backend directory' });
    }

    try {
        const sql = fs.readFileSync(sqlPath, 'utf8');
        // Split SQL into parts if it's too large, or try multipleStatements if the driver supports it
        // Since we updated db.js to use createPool without multipleStatements enabled globally, 
        // we'll use a local connection for this one-time task.
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false },
            multipleStatements: true
        });

        console.log('--- Starting Cloud Import ---');
        await connection.query(sql);
        await connection.end();
        res.json({ message: 'Cloud database import successful!' });
    } catch (err) {
        console.error('Import failed:', err);
        res.status(500).json({ message: 'Import failed: ' + err.message });
    }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);

        // Test Database Connection
        const db = require('./config/db');
        try {
            await db.query('SELECT 1');
            console.log('Database connected successfully');
        } catch (err) {
            console.error('Database connection failed:', err.message);
        }
    });
}

module.exports = app;
