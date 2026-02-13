const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function reset() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        console.log('Resetting database...');
        const sql = fs.readFileSync(path.join(__dirname, 'database', 'reset_and_seed.sql'), 'utf8');
        await connection.query(sql);
        console.log('Database reset and seeded successfully!');
    } catch (err) {
        console.error('Error resetting database:', err);
    } finally {
        await connection.end();
    }
}

reset();
