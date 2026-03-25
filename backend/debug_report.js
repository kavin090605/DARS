const db = require('./config/db');

async function debugReport() {
    try {
        console.log('Testing student report generation...');
        // Assume we test for the first student in the DB
        const [students] = await db.execute('SELECT user_id, id FROM students LIMIT 1');
        if (students.length === 0) {
            console.log('No students found in DB.');
            process.exit(0);
        }

        const userId = students[0].user_id;
        const studentId = students[0].id;
        console.log(`Testing for UserID: ${userId}, StudentID: ${studentId}`);

        // Replicate logic from studentRoutes.js
        const [studentInfo] = await db.execute(`
            SELECT u.name, u.email, s.roll_no, s.dept as department, s.year, s.dob, s.id
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = ?
        `, [userId]);

        const student = studentInfo[0];
        console.log('Student Info:', student);

        const [marks] = await db.execute(`
            SELECT m.*, s.name as subject_name, s.semester, s.credits 
            FROM marks m 
            JOIN subjects s ON m.subject_id = s.id 
            WHERE m.student_id = ?
            ORDER BY s.semester, s.name`, [student.id]);

        console.log(`Found ${marks.length} marks.`);

        const [attendanceRecords] = await db.execute(`
            SELECT a.*, s.name as subject_name, s.semester 
            FROM attendance a 
            JOIN subjects s ON a.subject_id = s.id 
            WHERE a.student_id = ?`, [student.id]);

        console.log(`Found ${attendanceRecords.length} attendance records.`);

        const allSemesters = [...new Set(marks.map(m => Number(m.semester)))].sort((a, b) => b - a);
        const currentSemester = allSemesters.length > 0 ? allSemesters[0] : 1;
        console.log(`Current Semester identified as: ${currentSemester}`);

        const attendance = attendanceRecords.filter(a => Number(a.semester) === currentSemester);
        console.log(`Filtered attendance records: ${attendance.length}`);

        let totalAttended = 0;
        let totalClasses = 0;
        attendance.forEach(a => {
            totalAttended += a.attended_classes;
            totalClasses += a.total_classes;
        });
        const overallAttendance = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(2)) : 0;
        console.log(`Overall Attendance: ${overallAttendance}%`);

        console.log('Report generation successful!');
        process.exit(0);
    } catch (err) {
        console.error('ERROR during report generation:', err);
        process.exit(1);
    }
}

debugReport();
