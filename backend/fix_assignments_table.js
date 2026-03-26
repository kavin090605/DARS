const db = require('./config/db');

async function migrate() {
    try {
        console.log('--- Fixing Assignments Table Schema ---');
        
        // Check if columns exist first to avoid errors
        const [columns] = await db.execute('SHOW COLUMNS FROM assignments');
        const columnNames = columns.map(c => c.Field);
        
        if (!columnNames.includes('dept')) {
            await db.execute('ALTER TABLE assignments ADD COLUMN dept VARCHAR(100) AFTER subject_name');
            console.log('✔ dept column added');
        } else {
            console.log('✔ dept column already exists');
        }
        
        if (!columnNames.includes('year')) {
            await db.execute('ALTER TABLE assignments ADD COLUMN year INT AFTER dept');
            console.log('✔ year column added');
        } else {
            console.log('✔ year column already exists');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
