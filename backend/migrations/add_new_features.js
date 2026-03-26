const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('--- Running New Features Migration ---');

    // 1. Events Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            event_type ENUM('Sports', 'Cultural', 'Academic', 'Hackathon', 'Workshop') NOT NULL,
            event_date DATE NOT NULL,
            location VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✔ events table ready');

    // 2. Academic Calendar Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS academic_calendar (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            event_date DATE NOT NULL,
            event_type ENUM('Holiday', 'Exam', 'Semester Start', 'Semester End', 'Event', 'Other') NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✔ academic_calendar table ready');

    // 3. Achievements Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            category ENUM('Sports', 'Academic', 'Cultural', 'Hackathon', 'Certification', 'Other') NOT NULL,
            description TEXT,
            date_achieved DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `);
    console.log('✔ achievements table ready');

    // 4. Assignments Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_user_id INT NOT NULL,
            subject_name VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            due_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('✔ assignments table ready');

    // 5. Study Materials Table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS study_materials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_user_id INT NOT NULL,
            subject_name VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log('✔ study_materials table ready');

    console.log('--- Migration Complete ---');
    await db.end();
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
