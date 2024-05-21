require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log(result.rows);
  });
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/highscores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM highscores');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/highscores', async (req, res) => {
  const { name, score } = req.body;
  if (!name || !score) {
    return res.status(400).json({ error: 'Name and score are required' });
  }
  try {
    await pool.query('INSERT INTO highscores (name, score) VALUES ($1, $2)', [name, score]);
    res.status(201).json({ message: 'Highscore added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
