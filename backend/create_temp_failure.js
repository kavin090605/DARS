const db = require('./config/db');

async function createFailure() {
    try {
        // Update the first mark record to be a failure
        await db.execute('UPDATE marks SET internal = 10, exam = 10 WHERE id = 1');
        console.log('Temporary failure created for mark ID 1 (Student ID 1 likely)');
        process.exit(0);
    } catch (e) {
        console.error('Failed to create failure:', e.message);
        process.exit(1);
    }
}

createFailure();
