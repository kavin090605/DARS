const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

async function checkIT() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        const [students] = await connection.execute('SELECT COUNT(*) as count FROM students WHERE dept = "Information Technology"');
        const [faculty] = await connection.execute('SELECT COUNT(*) as count FROM faculty WHERE dept = "Information Technology"');
        const [subjects] = await connection.execute('SELECT COUNT(*) as count FROM subjects WHERE dept = "Information Technology"');

        console.log('--- IT Department Status ---');
        console.log(`Students: ${students[0].count}`);
        console.log(`Faculty: ${faculty[0].count}`);
        console.log(`Subjects: ${subjects[0].count}`);

    } catch (err) {
        console.error('Error checking IT status:', err);
    } finally {
        if (connection) await connection.end();
    }
}

checkIT();
