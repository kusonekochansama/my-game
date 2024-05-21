const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

app.get('/api/highscores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM highscores');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/highscores', async (req, res) => {
  const { name, score } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO highscores (name, score) VALUES ($1, $2) RETURNING *',
      [name, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
