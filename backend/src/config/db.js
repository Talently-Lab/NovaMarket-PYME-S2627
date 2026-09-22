const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render') || process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false
});


const connectDB = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log(' Conexión a la base de datos establecida correctamente:', res.rows[0].now);
    client.release();
  } catch (error) {
    console.error(' Error conectando a la base de datos:', error.message);
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connectDB
};