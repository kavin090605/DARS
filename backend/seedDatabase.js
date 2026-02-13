const fs = require('fs');
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection WITHOUT selecting a database initially
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const seedDatabase = async () => {
    try {
        // Read SQL file
        const sql = fs.readFileSync('./database/reset_and_seed.sql', 'utf8');
        
        // Split by semicolons and filter empty statements
        const statements = sql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
        
        console.log(`Found ${statements.length} SQL statements to execute...`);
        
        for (let i = 0; i < statements.length; i++) {
            try {
                connection.query(statements[i], (err, results) => {
                    if (err) {
                        console.error(`Error in statement ${i + 1}:`, err.message);
                    } else {
                        console.log(`✓ Statement ${i + 1} executed successfully`);
                    }
                });
            } catch (err) {
                console.error(`Error executing statement ${i + 1}:`, err.message);
            }
        }
        
        // Close connection after all queries
        setTimeout(() => {
            connection.end();
            console.log('\n✅ Database seeding completed!');
            process.exit(0);
        }, 3000);
        
    } catch (err) {
        console.error('Error reading SQL file:', err.message);
        connection.end();
        process.exit(1);
    }
};

connection.connect((err) => {
    if (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL');
    seedDatabase();
});
