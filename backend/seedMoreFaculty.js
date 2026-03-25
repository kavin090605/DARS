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

const TARGET_PER_DEPT = 15;
const PASSWORD_HASH = '$2b$10$f1dZnel9GHauRRIpT4ZK7.pYJKQ4Sg2FmlfARJMrjBbJh.ggqBZaK'; // password123

const FIRST_NAMES = ['Dr. Rajesh', 'Prof. Sunita', 'Dr. Amit', 'Prof. Priya', 'Dr. Vikram', 'Prof. Anjali', 'Dr. Suresh', 'Prof. Meena', 'Dr. Karan', 'Prof. Shweta', 'Dr. Sanjay', 'Prof. Kavita', 'Dr. Rahul', 'Prof. Pooja', 'Dr. Manoj', 'Prof. Swati'];
const LAST_NAMES = ['Iyer', 'Chatterjee', 'Dubey', 'Mukherjee', 'Malhotra', 'Kapoor', 'Reddy', 'Nair', 'Deshmukh', 'Patil', 'Bose', 'Gupta', 'Singh', 'Sharma', 'Verma', 'Mittal'];

const SUBJECTS = {
    'Computer Science': ['AI', 'OS', 'Compilers', 'Cybersecurity', 'ML', 'Graphics'],
    'Information Technology': ['Web Technologies', 'Databases', 'Java', 'Python', 'Cloud Computing', 'Big Data'],
    'Electronics and Communication': ['VLSI', 'Antennas', 'DSP', 'Control Systems', 'Communication Systems', 'Embedded Systems'],
    'Mechanical Engineering': ['CAD', 'Robotics', 'Fluid Mechanics', 'Heat Transfer', 'Manufacturing', 'Automobile'],
    'Civil Engineering': ['Surveying', 'Hydrology', 'Geology', 'Bridges', 'Transportation', 'Urban Planning'],
    'Electrical Engineering': ['Sensors', 'Robotics', 'Power Electronics', 'Renewable Energy', 'Electrical Machines', 'Drives']
};

async function seedFaculty() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('Connected to database.');

        for (const dept of DEPARTMENTS) {
            const [rows] = await connection.execute(
                'SELECT COUNT(*) as count FROM faculty WHERE dept = ?',
                [dept]
            );
            const currentCount = rows[0].count;
            const needed = TARGET_PER_DEPT - currentCount;

            if (needed > 0) {
                console.log(`Seeding ${needed} faculty for ${dept}...`);
                for (let i = 0; i < needed; i++) {
                    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
                    const name = `${firstName} ${lastName}`;
                    const timestamp = Date.now() + Math.floor(Math.random() * 1000000);
                    const email = `${firstName.split(' ')[1].toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@faculty.com`;
                    const deptSubjects = SUBJECTS[dept] || ['General Engineering'];
                    const subject = deptSubjects[Math.floor(Math.random() * deptSubjects.length)];

                    // Insert into users
                    const [userResult] = await connection.execute(
                        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                        [name, email, PASSWORD_HASH, 'Faculty']
                    );
                    const userId = userResult.insertId;

                    // Insert into faculty
                    await connection.execute(
                        'INSERT INTO faculty (dept, age, dob, subject, doj, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                        [dept, 40 + Math.floor(Math.random() * 20), '1980-01-01', subject, '2020-01-01', userId]
                    );
                }
            } else {
                console.log(`${dept} already has ${currentCount} faculty members.`);
            }
        }

        console.log('✅ Faculty seeding completed successfully!');
    } catch (err) {
        console.error('❌ Faculty seeding failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seedFaculty();
