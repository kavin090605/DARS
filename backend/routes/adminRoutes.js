const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware to ensure only Admin can access these routes
router.use(authenticateToken, authorizeRole(['Admin']));

// --- Faculty Management ---
router.post('/faculty', async (req, res) => {
    const { name, email, password, dept, age, dob, subject, doj } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'Faculty']
        );
        const userId = userResult.insertId;
        await connection.execute(
            'INSERT INTO faculty (dept, age, dob, subject, doj, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [dept, age, dob, subject, doj, userId]
        );
        await connection.commit();
        res.status(201).json({ message: 'Faculty created successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('Faculty Creation Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error creating faculty', error: err.message });
    } finally {
        connection.release();
    }
});

router.get('/faculty', async (req, res) => {
    try {
        const [faculty] = await db.execute(`
            SELECT f.id, u.name, u.email, f.dept, f.age, f.dob, f.subject, f.doj
            FROM faculty f 
            JOIN users u ON f.user_id = u.id
        `);
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching faculty', error: err.message });
    }
});

// --- Student Management ---
router.post('/students', async (req, res) => {
    const { name, email, password, roll_no, dept, year, dob } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'Student']
        );
        const userId = userResult.insertId;
        await connection.execute(
            'INSERT INTO students (roll_no, dept, year, dob, user_id) VALUES (?, ?, ?, ?, ?)',
            [roll_no, dept, year, dob, userId]
        );
        await connection.commit();
        res.status(201).json({ message: 'Student created successfully' });
    } catch (err) {
        await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Roll no or Email already exists' });
        }
        res.status(500).json({ message: 'Error creating student', error: err.message });
    } finally {
        connection.release();
    }
});

router.get('/students', async (req, res) => {
    try {
        const [students] = await db.execute(`
            SELECT s.id, u.name, u.email, s.roll_no, s.dept, s.year, s.dob
            FROM students s 
            JOIN users u ON s.user_id = u.id
        `);
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students', error: err.message });
    }
});

// --- Subject Management ---
router.post('/subjects', async (req, res) => {
    const { id, name, dept, year, semester, credits } = req.body;
    try {
        await db.execute(
            'INSERT INTO subjects (id, name, dept, year, semester, credits) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, dept, year, semester, credits || 3]
        );
        res.status(201).json({ message: 'Subject created successfully' });
    } catch (err) {
        console.error('Subject Creation Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Subject ID already exists' });
        }
        res.status(500).json({ message: 'Error creating subject', error: err.message });
    }
});

router.get('/subjects', async (req, res) => {
    try {
        const [subjects] = await db.execute('SELECT * FROM subjects');
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
});

// --- Statistics ---
router.get('/stats', async (req, res) => {
    try {
        const [[{ totalStudents }]] = await db.execute('SELECT COUNT(*) as totalStudents FROM students');
        const [[{ totalFaculty }]] = await db.execute('SELECT COUNT(*) as totalFaculty FROM faculty');
        const [[{ totalSubjects }]] = await db.execute('SELECT COUNT(*) as totalSubjects FROM subjects');
        res.json({ totalStudents, totalFaculty, totalSubjects });
    } catch (err) {
        console.error('Stats Fetch Error:', err);
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
});

// --- Delete Functionality ---

// Delete Faculty
router.delete('/faculty/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // Get user_id first
        const [faculty] = await connection.execute('SELECT user_id FROM faculty WHERE id = ?', [id]);
        if (faculty.length === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        const userId = faculty[0].user_id;
        // Delete user (cascade will handle faculty record if not already handled, but database schema has ON DELETE CASCADE on user_id)
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        await connection.commit();
        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: 'Error deleting faculty', error: err.message });
    } finally {
        connection.release();
    }
});

// Delete Student
router.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // Get user_id first
        const [students] = await connection.execute('SELECT user_id FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const userId = students[0].user_id;
        // Delete user
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        await connection.commit();
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ message: 'Error deleting student', error: err.message });
    } finally {
        connection.release();
    }
});

// Delete Subject
router.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM subjects WHERE id = ?', [id]);
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting subject', error: err.message });
    }
});

// Delete Department (Deletes all associated faculty, students, and subjects)
router.delete('/departments/:deptName', async (req, res) => {
    const { deptName } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Delete associated users for faculty in this dept
        await connection.execute(`
            DELETE FROM users WHERE id IN (
                SELECT user_id FROM faculty WHERE dept = ?
            )
        `, [deptName]);

        // 2. Delete associated users for students in this dept
        await connection.execute(`
            DELETE FROM users WHERE id IN (
                SELECT user_id FROM students WHERE dept = ?
            )
        `, [deptName]);

        // 3. Delete subjects in this dept
        await connection.execute('DELETE FROM subjects WHERE dept = ?', [deptName]);

        // Note: Students and Faculty records are deleted via CASCADE when the User is deleted.
        // Marks and Attendance are deleted via CASCADE when the Student/Subject is deleted.

        await connection.commit();
        res.json({ message: `Department '${deptName}' and all associated records deleted successfully` });
    } catch (err) {
        await connection.rollback();
        console.error('Dept Delete Error:', err);
        res.status(500).json({ message: 'Error deleting department', error: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
