const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedSyllabus() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('--- Seeding Syllabus Data ---');

        // Get some subjects for 7th semester
        const [subjects] = await db.execute('SELECT id, name FROM subjects WHERE semester = 7');

        if (subjects.length === 0) {
            console.log('No 7th sem subjects found. Check your database.');
            process.exit(0);
        }

        const syllabusData = [
            { unit: 1, topic: 'Introduction and Basic Concepts' },
            { unit: 2, topic: 'Core Architecture and Design Patterns' },
            { unit: 3, topic: 'Advanced Implementation Techniques' },
            { unit: 4, topic: 'Optimization and Performance Tuning' },
            { unit: 5, topic: 'Security and Deployment Strategies' }
        ];

        for (const sub of subjects) {
            console.log(`Seeding syllabus for: ${sub.name} (${sub.id})`);
            for (const item of syllabusData) {
                await db.execute(
                    'INSERT IGNORE INTO syllabus_topics (subject_id, unit_number, topic_name) VALUES (?, ?, ?)',
                    [sub.id, item.unit, item.topic]
                );
            }
        }

        console.log('✔ Syllabus seeding complete');
        await db.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding syllabus:', err.message);
        process.exit(1);
    }
}

seedSyllabus();
