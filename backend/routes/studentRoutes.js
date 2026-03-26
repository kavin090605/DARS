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
            SELECT u.name, u.email, s.roll_no, s.dept as department, s.year, s.dob, s.id
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = ?
        `, [userId]);

        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student info not found' });
        const student = studentInfo[0];

        // Get marks with subject details (including semester and credits)
        const [marks] = await db.execute(`
            SELECT m.*, s.name as subject_name, s.semester, s.credits 
            FROM marks m 
            JOIN subjects s ON m.subject_id = s.id 
            WHERE m.student_id = ?
            ORDER BY s.semester, s.name`, [student.id]);

        // Get attendance with semester info
        const [attendanceRecords] = await db.execute(`
            SELECT a.*, s.name as subject_name, s.semester 
            FROM attendance a 
            JOIN subjects s ON a.subject_id = s.id 
            WHERE a.student_id = ?`, [student.id]);

        // Identify latest semester (the "current" one)
        const allSemesters = [...new Set(marks.map(m => Number(m.semester)))].sort((a, b) => b - a);
        const currentSemester = allSemesters.length > 0 ? allSemesters[0] : 1;

        // Filter attendance to ONLY records matching the current semester
        const attendance = attendanceRecords.filter(a => Number(a.semester) === currentSemester);

        // Calculate overall attendance
        let totalAttended = 0;
        let totalClasses = 0;
        attendance.forEach(a => {
            totalAttended += a.attended_classes;
            totalClasses += a.total_classes;
        });
        const overallAttendance = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(2)) : 0;

        // Grade calculation logic (10-point scale)
        const getGradePoints = (total) => {
            if (total >= 90) return 10;
            if (total >= 80) return 9;
            if (total >= 70) return 8;
            if (total >= 60) return 7;
            if (total >= 50) return 6;
            if (total >= 40) return 5;
            return 0;
        };

        // Group by semester and calculate GPA/CGPA
        const semesterData = {};
        let totalGradePointsCredits = 0;
        let totalCredits = 0;

        // Identify latest semester (the "current" one)
        const allSems = [...new Set(marks.map(m => Number(m.semester)))].sort((a, b) => b - a);
        // Identify the "expected" current semester based on student year
        const expectedSem = student.year * 2 - 1;
        const actualMaxSem = allSems.length > 0 ? allSems[0] : 0;
        const currentSemNum = Math.max(expectedSem, actualMaxSem);

        // Ensure all semesters from 1 up to currentSemNum exist in semesterData
        for (let i = 1; i <= currentSemNum; i++) {
            if (!semesterData[i]) {
                semesterData[i] = { marks: [], gpa: 0, totalCredits: 0, totalGradePointsCredits: 0, isContinuing: true };
            }
        }

        marks.forEach(m => {
            const sem = m.semester;
            if (!semesterData[sem]) {
                semesterData[sem] = { marks: [], gpa: 0, totalCredits: 0, totalGradePointsCredits: 0 };
            }
            const gradePoints = getGradePoints(m.total);
            m.gradePoints = gradePoints;

            semesterData[sem].marks.push(m);

            // Calculate SGPA for all semesters where marks are entered
            semesterData[sem].totalCredits += m.credits;
            semesterData[sem].totalGradePointsCredits += (gradePoints * m.credits);

            // Add to CGPA calculation
            totalCredits += m.credits;
            totalGradePointsCredits += (gradePoints * m.credits);
        });

        // Finalize GPA for each semester
        Object.keys(semesterData).forEach(sem => {
            const data = semesterData[sem];
            if (data.totalCredits > 0) {
                data.gpa = parseFloat((data.totalGradePointsCredits / data.totalCredits).toFixed(2));
                data.isContinuing = false; // It has marks, so it's not JUST continuing
            } else {
                data.gpa = 0;
                data.isContinuing = true;
            }
        });

        const cgpa = totalCredits > 0 ? parseFloat((totalGradePointsCredits / totalCredits).toFixed(2)) : 0;

        res.json({
            student,
            marks,
            attendance,
            overallAttendance,
            semesterData,
            cgpa
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching report', error: err.message });
    }
});

// Get Syllabus for a subject
router.get('/syllabus/:subjectId', async (req, res) => {
    try {
        const [topics] = await db.execute(
            'SELECT * FROM syllabus_topics WHERE subject_id = ? ORDER BY unit_number',
            [req.params.subjectId]
        );
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching syllabus', error: err.message });
    }
});

// Get Notifications
router.get('/notifications', async (req, res) => {
    try {
        const [notifications] = await db.execute(
            'SELECT * FROM student_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notifications', error: err.message });
    }
});

// Mark Notification as Read
router.post('/notifications/read/:id', async (req, res) => {
    try {
        await db.execute(
            'UPDATE student_notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating notification', error: err.message });
    }
});

// Submit Subject Feedback
router.post('/feedback', async (req, res) => {
    const { subject_id, feedback_text, is_anonymous } = req.body;
    try {
        // Get student id
        const [studentInfo] = await db.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student not found' });

        await db.execute(
            'INSERT INTO subject_feedback (student_id, subject_id, feedback_text, is_anonymous) VALUES (?, ?, ?, ?)',
            [studentInfo[0].id, subject_id, feedback_text, is_anonymous]
        );
        res.json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting feedback', error: err.message });
    }
});

// Get My Feedback with Faculty Replies
router.get('/my-feedback', async (req, res) => {
    try {
        const [studentInfo] = await db.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student not found' });

        const [feedback] = await db.execute(`
            SELECT sf.id, sf.feedback_text, sf.created_at, sf.faculty_reply, sf.replied_at, s.name as subject_name
            FROM subject_feedback sf
            JOIN subjects s ON sf.subject_id = s.id
            WHERE sf.student_id = ?
            ORDER BY sf.created_at DESC
        `, [studentInfo[0].id]);

        res.json(feedback);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching feedback', error: err.message });
    }
});

// --- Achievements ---
router.post('/achievements', async (req, res) => {
    const { title, category, description, date_achieved } = req.body;
    try {
        const [studentInfo] = await db.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student not found' });

        await db.execute(
            'INSERT INTO achievements (student_id, title, category, description, date_achieved) VALUES (?, ?, ?, ?, ?)',
            [studentInfo[0].id, title, category, description, date_achieved]
        );
        res.status(201).json({ message: 'Achievement added' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding achievement', error: err.message });
    }
});

router.get('/achievements', async (req, res) => {
    try {
        const [studentInfo] = await db.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student not found' });

        const [achievements] = await db.execute(
            'SELECT * FROM achievements WHERE student_id = ? ORDER BY date_achieved DESC',
            [studentInfo[0].id]
        );
        res.json(achievements);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching achievements', error: err.message });
    }
});

router.delete('/achievements/:id', async (req, res) => {
    try {
        const [studentInfo] = await db.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student not found' });

        await db.execute('DELETE FROM achievements WHERE id = ? AND student_id = ?', [req.params.id, studentInfo[0].id]);
        res.json({ message: 'Achievement deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting achievement', error: err.message });
    }
});

// Get My Assignments (Filtered by Dept and Year)
router.get('/assignments', async (req, res) => {
    try {
        // Get student's dept and year first
        const [studentInfo] = await db.execute('SELECT dept, year FROM students WHERE user_id = ?', [req.user.id]);
        if (studentInfo.length === 0) return res.status(404).json({ message: 'Student not found' });
        
        const { dept, year } = studentInfo[0];

        // Fetch assignments that match the student's dept and year, or those assigned to ALL students (null dept/year)
        const [assignments] = await db.execute(`
            SELECT a.id, a.title, a.description, a.due_date, a.subject_name, u.name as faculty_name
            FROM assignments a
            JOIN users u ON a.faculty_user_id = u.id
            WHERE (a.dept = ? AND a.year = ?) OR (a.dept IS NULL AND a.year IS NULL)
            ORDER BY a.due_date ASC
        `, [dept, year]);

        res.json(assignments);
    } catch (err) {
        console.error('Fetch Student Assignments Error:', err);
        res.status(500).json({ message: 'Error fetching assignments', error: err.message });
    }
});

module.exports = router;
