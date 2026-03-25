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

// Fetch unique departments and years for dropdowns
router.get('/metadata', async (req, res) => {
    try {
        const [depts] = await db.execute('SELECT DISTINCT dept FROM subjects');
        const [years] = await db.execute('SELECT DISTINCT year FROM subjects');
        res.json({
            departments: depts.map(d => d.dept),
            years: years.map(y => y.year)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching metadata', error: err.message });
    }
});

// Fetch subjects (optionally filtered by dept and year)
router.get('/subjects', async (req, res) => {
    const { dept, year } = req.query;
    try {
        let query = 'SELECT * FROM subjects';
        let params = [];

        if (dept && year) {
            query += ' WHERE dept = ? AND year = ?';
            params = [dept, year];
        } else if (dept) {
            query += ' WHERE dept = ?';
            params = [dept];
        } else if (year) {
            query += ' WHERE year = ?';
            params = [year];
        }

        const [subjects] = await db.execute(query, params);
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
});

// Fetch students for a department/year (to enter marks/attendance)
router.get('/students/:dept/:year', async (req, res) => {
    const { subject_id } = req.query;
    try {
        let query = `
            SELECT s.id, u.name, s.roll_no 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.dept = ? AND s.year = ?
        `;
        let params = [req.params.dept, req.params.year];

        if (subject_id) {
            query = `
                SELECT s.id, u.name, s.roll_no, 
                       IFNULL(a.attended_classes, 0) as current_attended, 
                       IFNULL(a.total_classes, 0) as current_total
                FROM students s 
                JOIN users u ON s.user_id = u.id 
                LEFT JOIN attendance a ON s.id = a.student_id AND a.subject_id = ?
                WHERE s.dept = ? AND s.year = ?
            `;
            params = [subject_id, req.params.dept, req.params.year];
        }

        const [students] = await db.execute(query, params);
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students', error: err.message });
    }
});

// Enter Marks
router.post('/marks', async (req, res) => {
    const { student_id, subject_id, internal, exam } = req.body;

    // Validation
    const intMark = parseInt(internal) || 0;
    const examMark = parseInt(exam) || 0;

    if (intMark > 40) {
        return res.status(400).json({ message: 'Internal marks cannot exceed 40' });
    }
    if (examMark > 60) {
        return res.status(400).json({ message: 'Exam marks cannot exceed 60' });
    }

    try {
        await db.execute(
            'INSERT INTO marks (student_id, subject_id, internal, exam) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE internal = VALUES(internal), exam = VALUES(exam)',
            [student_id, subject_id, intMark, examMark]
        );

        // Fetch student user_id and subject name for notification
        const [[student]] = await db.execute('SELECT user_id FROM students WHERE id = ?', [student_id]);
        const [[subject]] = await db.execute('SELECT name FROM subjects WHERE id = ?', [subject_id]);

        if (student) {
            await db.execute(
                'INSERT INTO student_notifications (user_id, message, type) VALUES (?, ?, ?)',
                [student.user_id, `Your marks for ${subject.name} have been updated (Internal: ${intMark}/40, Exam: ${examMark}/60).`, 'MARKS_UPDATE']
            );
        }

        res.json({ message: 'Marks updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating marks', error: err.message });
    }
});

// Enter Attendance
router.post('/attendance', async (req, res) => {
    const { student_id, subject_id, attended_classes, total_classes } = req.body;

    const attended = parseInt(attended_classes) || 0;
    const total = parseInt(total_classes) || 0;

    if (attended < 0 || total < 0) {
        return res.status(400).json({ message: 'Values cannot be negative' });
    }

    if (attended > total) {
        return res.status(400).json({ message: 'Attended classes cannot exceed total classes' });
    }

    try {
        await db.execute(
            `INSERT INTO attendance (student_id, subject_id, attended_classes, total_classes) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             attended_classes = attended_classes + VALUES(attended_classes), 
             total_classes = total_classes + VALUES(total_classes)`,
            [student_id, subject_id, attended, total]
        );

        // Fetch student user_id and subject name for notification
        const [[student]] = await db.execute('SELECT user_id FROM students WHERE id = ?', [student_id]);
        const [[subject]] = await db.execute('SELECT name FROM subjects WHERE id = ?', [subject_id]);

        if (student) {
            await db.execute(
                'INSERT INTO student_notifications (user_id, message, type) VALUES (?, ?, ?)',
                [student.user_id, `Attendance updated for ${subject.name} (+${attended} attended out of ${total} held).`, 'ATTENDANCE_UPDATE']
            );
        }

        res.json({ message: 'Attendance updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating attendance', error: err.message });
    }
});

module.exports = router;
