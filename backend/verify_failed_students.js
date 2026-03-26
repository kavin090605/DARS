const db = require('./config/db');

async function verifyFailedStudents() {
    try {
        console.log('\n--- Failed Students Details ---');
        const [failedStudents] = await db.execute(`
            SELECT u.name, s.roll_no, s.dept, GROUP_CONCAT(sub.name SEPARATOR ', ') as failed_subjects
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN marks m ON s.id = m.student_id
            JOIN subjects sub ON m.subject_id = sub.id
            WHERE m.total < 40
            GROUP BY s.id, u.name, s.roll_no, s.dept
            ORDER BY s.dept, u.name
        `);
        console.log(JSON.stringify(failedStudents, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('Failed students verification failed:', e.message);
        process.exit(1);
    }
}

verifyFailedStudents();
