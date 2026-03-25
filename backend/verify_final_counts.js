const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

async function verifyAll() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        const [rows] = await connection.execute(`
            SELECT dept, year, COUNT(*) as count 
            FROM students 
            GROUP BY dept, year 
            ORDER BY dept, year
        `);

        console.log('--- Final Student Counts ---');
        rows.forEach(row => {
            console.log(`${row.dept} - Year ${row.year}: ${row.count}`);
        });

    } catch (err) {
        console.error('Error verifying counts:', err);
    } finally {
        if (connection) await connection.end();
    }
}

verifyAll();
