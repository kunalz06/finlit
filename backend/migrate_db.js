const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrate() {
    try {
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
    `);
        console.log('Successfully added profile_image column to users table.');
    } catch (error) {
        console.error('Error executing migration:', error);
    } finally {
        await pool.end();
    }
}

migrate();
