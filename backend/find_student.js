const mysql = require('mysql2/promise');
require('dotenv').config();

async function findStudent() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [users] = await db.execute('SELECT email, role FROM users WHERE role = "Student" LIMIT 5');
        console.log('--- Student Users ---');
        console.table(users);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

findStudent();
