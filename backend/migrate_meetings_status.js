const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE meetings 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
        `);
        console.log('Successfully added status column to meetings table.');
    } catch (error) {
        console.error('Error executing migration:', error);
    } finally {
        await pool.end();
    }
};

migrate();
