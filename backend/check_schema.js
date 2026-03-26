const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.execute('DESCRIBE assignments');
        console.log('--- Assignments Table Structure ---');
        rows.forEach(row => {
            console.log(`${row.Field} | ${row.Type} | ${row.Null} | ${row.Key} | ${row.Default}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
