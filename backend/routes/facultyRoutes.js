const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken, authorizeRole(['Faculty']));

// Fetch profile details
router.get('/profile', async (req, res) => {
    try {
        const [profile] = await db.execute(`
            SELECT u.name, u.email, f.dept, f.age, f.dob, f.subject, f.doj
            FROM faculty f 
            JOIN users u ON f.user_id = u.id
            WHERE u.id = ?
        `, [req.user.id]);

        if (profile.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
});

// Fetch all subjects (to populate dropdown)
router.get('/subjects', async (req, res) => {
    try {
        const [subjects] = await db.execute('SELECT * FROM subjects');
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
});

// Fetch students for a department/year (to enter marks/attendance)
router.get('/students/:dept/:year', async (req, res) => {
    try {
        const [students] = await db.execute(
            'SELECT s.id, u.name, s.roll_no FROM students s JOIN users u ON s.user_id = u.id WHERE s.dept = ? AND s.year = ?',
            [req.params.dept, req.params.year]
        );
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students', error: err.message });
    }
});

// Enter Marks
router.post('/marks', async (req, res) => {
    const { student_id, subject_id, internal, exam } = req.body;
    try {
        await db.execute(
            'INSERT INTO marks (student_id, subject_id, internal, exam) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE internal = VALUES(internal), exam = VALUES(exam)',
            [student_id, subject_id, internal, exam]
        );
        res.json({ message: 'Marks updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating marks', error: err.message });
    }
});

// Enter Attendance
router.post('/attendance', async (req, res) => {
    const { student_id, subject_id, attended_classes, total_classes } = req.body;
    try {
        await db.execute(
            'INSERT INTO attendance (student_id, subject_id, attended_classes, total_classes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE attended_classes = VALUES(attended_classes), total_classes = VALUES(total_classes)',
            [student_id, subject_id, attended_classes, total_classes]
        );
        res.json({ message: 'Attendance updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating attendance', error: err.message });
    }
});

module.exports = router;
