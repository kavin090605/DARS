const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken, authorizeRole(['Student']));

// Get Student Profile & Academic Data
router.get('/reports', async (req, res) => {
    const userId = req.user.id;
    try {
        // Get student info with user details
        const [studentInfo] = await db.execute(`
            SELECT u.name, u.email, s.roll_no, s.dept, s.year, s.dob, s.id
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = ?
        `, [userId]);

        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student info not found' });
        const student = studentInfo[0];

        // Get marks
        const [marks] = await db.execute(`
            SELECT m.*, s.name as subject_name 
            FROM marks m 
            JOIN subjects s ON m.subject_id = s.id 
            WHERE m.student_id = ?`, [student.id]);

        // Get attendance
        const [attendance] = await db.execute(`
            SELECT a.*, s.name as subject_name 
            FROM attendance a 
            JOIN subjects s ON a.subject_id = s.id 
            WHERE a.student_id = ?`, [student.id]);

        // Calculate overall attendance
        let totalAttended = 0;
        let totalClasses = 0;
        attendance.forEach(a => {
            totalAttended += a.attended_classes;
            totalClasses += a.total_classes;
        });
        const overallAttendance = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(2)) : 0;

        res.json({ student, marks, attendance, overallAttendance });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching report', error: err.message });
    }
});

module.exports = router;
