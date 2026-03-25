const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dars_db'
};

const DEPARTMENTS = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
];

const YEARS = [1, 2, 3, 4];
const TARGET_PER_GROUP = 10;
const PASSWORD_HASH = '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK'; // password123

const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Aaryan', 'Rohan', 'Ananya', 'Diya', 'Ishani', 'Myra', 'Saanvi', 'Riya', 'Zara', 'Sanya', 'Arnav', 'Vivaan', 'Kavya', 'Aditi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Chopra', 'Malhotra', 'Mehta', 'Joshi', 'Mishra', 'Pandey', 'Yadav', 'Rao', 'Kulkarni', 'Deshmukh', 'Saxena'];

async function seed() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('Connected to database.');

        for (const dept of DEPARTMENTS) {
            for (const year of YEARS) {
                const [rows] = await connection.execute(
                    'SELECT COUNT(*) as count FROM students WHERE dept = ? AND year = ?',
                    [dept, year]
                );
                const currentCount = rows[0].count;
                const needed = TARGET_PER_GROUP - currentCount;

                if (needed > 0) {
                    console.log(`Seeding ${needed} students for ${dept} - Year ${year}...`);
                    for (let i = 0; i < needed; i++) {
                        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
                        const name = `${firstName} ${lastName}`;
                        const timestamp = Date.now() + Math.floor(Math.random() * 1000000);
                        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@student.com`;
                        const rollNo = `${dept.substring(0, 2).toUpperCase()}${year}${timestamp.toString().slice(-5)}`;

                        // Insert into users
                        const [userResult] = await connection.execute(
                            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                            [name, email, PASSWORD_HASH, 'Student']
                        );
                        const userId = userResult.insertId;

                        // Insert into students
                        await connection.execute(
                            'INSERT INTO students (roll_no, dept, year, user_id, dob) VALUES (?, ?, ?, ?, ?)',
                            [rollNo, dept, year, userId, '2005-01-01']
                        );
                    }
                } else {
                    console.log(`${dept} - Year ${year} already has ${currentCount} students.`);
                }
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
