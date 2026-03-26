# Vercel MySQL Deployment Guide

Since Vercel is a serverless platform, it cannot connect to your `localhost` MySQL database. You need a cloud-hosted MySQL database to make your deployed application work.

## Step 1: Get a Cloud MySQL Database
I recommend using **Aiven** or **Railway** for a free/low-cost MySQL instance:
1.  **Aiven**: Go to [aiven.io](https://aiven.io/), create a free MySQL service, and copy the connection URI or details (Host, Port, User, Password, Database Name).
2.  **Railway**: Go to [railway.app](https://railway.app/), start a new project, and add a MySQL plugin.

## Step 2: Export Your Local Database
Export your current `dars_db` structure and data to an `.sql` file:
```powershell
mysqldump -u root -p dars_db > backup.sql
```

## Step 3: Import into Cloud Database
Once you have your cloud database details, import your `backup.sql` into it. You can use a tool like **MySQL Workbench**, **DBeaver**, or the command line:
```powershell
mysql -h <cloud_host> -u <cloud_user> -p <cloud_db_name> < backup.sql
```

## Step 4: Configure Vercel Environment Variables
1.  Go to your **Vercel Dashboard** > **Project Settings** > **Environment Variables**.
2.  Add the following variables with your **Cloud Database** details:
    -   `DB_HOST`: The cloud host (e.g., `mysql-123.aivencloud.com`)
    -   `DB_USER`: The cloud user
    -   `DB_PASSWORD`: The cloud password
    -   `DB_NAME`: The cloud database name (usually `defaultdb` or `dars_db`)
    -   `JWT_SECRET`: Your secret key (same as local)
    -   `PORT`: `5000` (optional, as Vercel handles its own routing for serverless functions)

## Step 5: Update `backend/config/db.js` (SSL Tip)
Cloud databases often require SSL. Update your `backend/config/db.js` to handle this safely:
```javascript
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Cloud providers often need this
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

## Step 6: Redeploy
Push your changes to GitHub or run `vercel --prod` to trigger a new deployment. Vercel will now use the cloud database!
