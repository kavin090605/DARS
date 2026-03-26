const db = require('./config/db');

async function verifyQueries() {
    try {
        console.log('--- Students by Dept ---');
        const [deptStudents] = await db.execute(
            'SELECT dept, COUNT(*) as count FROM students GROUP BY dept ORDER BY dept'
        );
        console.log(deptStudents);

        console.log('\n--- Dept Avg Marks ---');
        const [deptAvgMarks] = await db.execute(`
            SELECT st.dept, ROUND(AVG(m.total), 1) as avg_marks
            FROM marks m
            JOIN students st ON m.student_id = st.id
            GROUP BY st.dept ORDER BY st.dept
        `);
        console.log(deptAvgMarks);

        console.log('\n--- Dept Pass/Fail ---');
        const [deptPassFail] = await db.execute(`
            SELECT dept, 
                   SUM(CASE WHEN status = 'Passed' THEN 1 ELSE 0 END) as passed,
                   SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed
            FROM (
                SELECT s.dept, s.id, 
                       CASE 
                           WHEN COUNT(m.id) = 0 THEN 'No Marks'
                           WHEN MIN(m.total) >= 40 THEN 'Passed'
                           ELSE 'Failed'
                       END as status
                FROM students s
                LEFT JOIN marks m ON s.id = m.student_id
                GROUP BY s.id, s.dept
            ) as student_status
            WHERE status != 'No Marks'
            GROUP BY dept ORDER BY dept
        `);
        console.log(deptPassFail);

        process.exit(0);
    } catch (e) {
        console.error('Query verification failed:', e.message);
        process.exit(1);
    }
}

verifyQueries();
