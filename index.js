const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/highscores', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM highscores ORDER BY score DESC LIMIT 5');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
