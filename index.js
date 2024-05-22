const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false } // SSL設定を追加
});

client.connect()
  .then(() => {
    console.log('Connected to the database');

    // テーブルの作成
    return client.query(`
      CREATE TABLE IF NOT EXISTS highscores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        score INT NOT NULL
      );
    `);
  })
  .then(() => {
    console.log('Table created or already exists.');
  })
  .catch(err => {
    console.error('Database operation error', err.stack);
  });

// ミドルウェア
app.use(express.json());

// ハイスコア取得エンドポイント
app.get('/api/highscores', (req, res) => {
  client.query('SELECT * FROM highscores ORDER BY score DESC LIMIT 10')
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error('Error executing query', err.stack);
      res.status(500).send('Error fetching highscores');
    });
});

// ハイスコア追加エンドポイント
app.post('/api/highscores', (req, res) => {
  const { name, score } = req.body;
  client.query('INSERT INTO highscores (name, score) VALUES ($1, $2) RETURNING *', [name, score])
    .then(result => {
      res.status(201).json(result.rows[0]);
    })
    .catch(err => {
      console.error('Error executing query', err.stack);
      res.status(500).send('Error adding highscore');
    });
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
