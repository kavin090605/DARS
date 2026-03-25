const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

async function verifyCurriculum() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        const [subjects] = await connection.execute('SELECT COUNT(*) as count FROM subjects');
        const [marks] = await connection.execute('SELECT COUNT(*) as count FROM marks');
        const [attendance] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
        const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');

        console.log('--- Curriculum Verification ---');
        console.log(`Total Subjects: ${subjects[0].count}`);
        console.log(`Total Students: ${students[0].count}`);
        console.log(`Total Marks Records: ${marks[0].count}`);
        console.log(`Total Attendance Records: ${attendance[0].count}`);

        // Expected marks/attendance = students * 5 (subjects per student)
        const expected = students[0].count * 5;
        console.log(`Expected Records: ${expected}`);

        if (marks[0].count === expected && attendance[0].count === expected) {
            console.log('✅ Mapping counts are correct!');
        } else {
            console.log('⚠️ Mapping counts mismatch.');
        }

    } catch (err) {
        console.error('Error verifying curriculum:', err);
    } finally {
        if (connection) await connection.end();
    }
}

verifyCurriculum();
