const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

async function checkFaculty() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        const [rows] = await connection.execute('SELECT dept, COUNT(*) as count FROM faculty GROUP BY dept');
        console.log('--- Current Faculty Counts ---');
        rows.forEach(row => {
            console.log(`${row.dept}: ${row.count}`);
        });
    } catch (err) {
        console.error('Error checking faculty status:', err);
    } finally {
        if (connection) await connection.end();
    }
}

checkFaculty();
