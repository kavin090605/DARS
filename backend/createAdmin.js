const bcrypt = require('bcryptjs');
const db = require('./config/db');

const createAdmin = async () => {
    const password = 'adminpassword';
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['System Admin', 'admin@dars.com', hashedPassword, 'Admin']
        );
        console.log('Admin user created: admin@dars.com / adminpassword');
        process.exit();
    } catch (err) {
        console.error('Error creating admin:', err.message);
        process.exit(1);
    }
};

createAdmin();
