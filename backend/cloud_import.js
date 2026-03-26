const fs = require('fs');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
require('dotenv').config();

(async () => {
  let dumpFile = 'backup.sql';
  console.log("Trying to create fresh dump of local DB...");
  const mysqldumpPaths = [
    'mysqldump',
    '"C:\\xampp\\mysql\\bin\\mysqldump.exe"',
    '"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"'
  ];

  let freshDump = false;
  for (const p of mysqldumpPaths) {
    try {
      execSync(`${p} -u root -pKavin@2005 dars_db > backup.sql`, { stdio: 'ignore' });
      console.log(`Successfully dumped local DB using ${p}`);
      freshDump = true;
      break;
    } catch (err) {}
  }

  if (!freshDump) {
    console.log("Could not fresh dump. Using existing dars_db.sql");
    dumpFile = 'dars_db.sql';
  }

  console.log("Connecting to Aiven Cloud DB...");
  const aivenConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-2451a1ee-kavin09062005-2767.e.aivencloud.com',
    port: 25148,
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });

  console.log("Connected to Aiven! Importing SQL...");
  const sql = fs.readFileSync(dumpFile, 'utf8');
  await aivenConn.query(sql);
  
  console.log("Cloud Database migrated successfully!");
  await aivenConn.end();
})();
