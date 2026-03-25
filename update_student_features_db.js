const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function updateSchema() {
    try {
        console.log('--- Updating Database Schema ---');
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 1. Syllabus Topics Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS syllabus_topics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                unit_number INT NOT NULL,
                topic_name VARCHAR(255) NOT NULL,
                is_completed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        `);
        console.log('✔ syllabus_topics table ready');

        // 2. Student Notifications Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS student_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✔ student_notifications table ready');

        // 3. Subject Feedback Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS subject_feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                subject_id INT NOT NULL,
                feedback_text TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        `);
        console.log('✔ subject_feedback table ready');

        console.log('--- Schema Update Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating schema:', err.message);
        process.exit(1);
    }
}

updateSchema();
