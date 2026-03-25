const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

const PASSWORD_HASH = '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK'; // password123

async function restore() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('Connected to database.');

        // 1. Restore IT Faculty Users if missing
        const facultyUsers = [
            { name: 'Prof. Robert Jones', email: 'robert.jones@dars.com' },
            { name: 'Prof. David Martinez', email: 'david.martinez@dars.com' }
        ];

        for (const f of facultyUsers) {
            const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [f.email]);
            let userId;
            if (rows.length === 0) {
                const [result] = await connection.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    [f.name, f.email, PASSWORD_HASH, 'Faculty']
                );
                userId = result.insertId;
            } else {
                userId = rows[0].id;
            }

            // Ensure faculty record exists
            const [fRows] = await connection.execute('SELECT id FROM faculty WHERE user_id = ?', [userId]);
            if (fRows.length === 0) {
                await connection.execute(
                    'INSERT INTO faculty (dept, age, dob, subject, doj, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                    ['Information Technology', 40, '1984-01-01', 'IT Subject', '2015-01-01', userId]
                );
            }
        }

        // 2. Restore IT Subjects
        const itSubjects = [
            { name: 'Web Development', year: 1 },
            { name: 'Cloud Computing', year: 2 },
            { name: 'Software Engineering', year: 3 },
            { name: 'Network Security', year: 4 }
        ];

        for (const s of itSubjects) {
            const [rows] = await connection.execute(
                'SELECT id FROM subjects WHERE name = ? AND dept = ?',
                [s.name, 'Information Technology']
            );
            if (rows.length === 0) {
                await connection.execute(
                    'INSERT INTO subjects (name, dept, year) VALUES (?, ?, ?)',
                    [s.name, 'Information Technology', s.year]
                );
            }
        }

        console.log('✅ IT Faculty and Subjects restored.');
        console.log('Now seeding students for IT...');

        // 3. Reuse student seeding logic for IT
        const DEPT = 'Information Technology';
        const YEARS = [1, 2, 3, 4];
        const TARGET_PER_GROUP = 10;
        const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Aaryan', 'Rohan', 'Ananya', 'Diya'];
        const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Iyer'];

        for (const year of YEARS) {
            const [rows] = await connection.execute(
                'SELECT COUNT(*) as count FROM students WHERE dept = ? AND year = ?',
                [DEPT, year]
            );
            const needed = TARGET_PER_GROUP - rows[0].count;

            if (needed > 0) {
                for (let i = 0; i < needed; i++) {
                    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
                    const name = `${firstName} ${lastName}`;
                    const timestamp = Date.now() + Math.round(Math.random() * 1000000);
                    const email = `it.${firstName.toLowerCase()}.${timestamp}@student.com`;
                    const rollNo = `IT${year}${timestamp.toString().slice(-6)}`;

                    const [uResult] = await connection.execute(
                        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        [name, email, PASSWORD_HASH, 'Student']
                    );
                    const userId = uResult.insertId;

                    await connection.execute(
                        'INSERT INTO students (roll_no, dept, year, user_id, dob) VALUES (?, ?, ?, ?, ?)',
                        [rollNo, DEPT, year, userId, '2005-01-01']
                    );
                }
            }
        }

        console.log('✅ IT Department fully restored with students.');

    } catch (err) {
        console.error('❌ Restoration failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

restore();
