require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/db');

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
        console.error(e);
    } finally {
        process.exit();
    }
}
findFaculty();
