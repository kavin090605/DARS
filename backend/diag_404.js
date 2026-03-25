const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 1. Check Student Users Mapping
        const [mapping] = await db.execute(`
            SELECT u.id, u.name, u.role, s.id as student_id 
            FROM users u 
            LEFT JOIN students s ON u.id = s.user_id 
            WHERE u.role = 'Student'
        `);

        const missing = mapping.filter(m => !m.student_id);
        if (missing.length > 0) {
            console.log('--- Students Missing Student Record ---');
            console.table(missing);
        } else {
            console.log('✔ All Student users have a linked student record.');
        }

        // 2. Check if there are any student IDs in marks/attendance that don't exist in students
        const [orphanMarks] = await db.execute('SELECT DISTINCT student_id FROM marks WHERE student_id NOT IN (SELECT id FROM students)');
        if (orphanMarks.length > 0) {
            console.log('--- Orphaned Marks (student_id missing in students table) ---');
            console.table(orphanMarks);
        }

        // 3. Test Student Dashboard API call logic
        if (mapping.length > 0 && mapping[0].student_id) {
            const studentUserId = mapping[0].id;
            console.log(`Checking studentRoutes.js logic for user_id: ${studentUserId}`);
            const [studentInfo] = await db.execute('SELECT * FROM students WHERE user_id = ?', [studentUserId]);
            console.log('Student Info Check:', studentInfo.length > 0 ? 'FOUND' : 'NOT FOUND');
        }

    } catch (err) {
        console.error('Diagnostic error:', err);
    } finally {
        await db.end();
    }
}

run();
