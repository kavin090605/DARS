const mysql = require('mysql2/promise');
require('dotenv').config();

async function poll() {
  console.log("Polling Aiven DB every 5 seconds for connection...");
  let attempt = 1;
  while (attempt <= 60) {
    try {
      const aivenConn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 5000
      });
      console.log(`\nConnection SUCCESS on attempt ${attempt}! IP restriction lifted.`);
      await aivenConn.end();
      process.exit(0);
    } catch (err) {
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, 5000));
      attempt++;
    }
  }
  console.log("\nPolling timed out after 5 minutes.");
  process.exit(1);
}

poll();
