require('dotenv').config();
const db = require('./config/db');

async function findFaculty() {
    try {
        const [rows] = await db.query(`
            SELECT users.name, users.email, faculty.subject 
            FROM users 
            JOIN faculty ON users.id = faculty.user_id 
            WHERE faculty.subject LIKE '%block%' OR faculty.subject LIKE '%chain%'
        `);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
findFaculty();
