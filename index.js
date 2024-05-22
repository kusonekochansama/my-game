const { Client } = require('pg');
require('dotenv').config();

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

    // 新しいスコアの挿入
    return client.query(`
      INSERT INTO highscores (name, score) VALUES
      ('Alice', 100),
      ('Bob', 200),
      ('Charlie', 150),
      ('Dave', 250);
    `);
  })
  .then(() => {
    console.log('Inserted new scores.');

    // スコアの取得
    return client.query('SELECT * FROM highscores');
  })
  .then(res => {
    console.log('Highscores:', res.rows);
  })
  .catch(err => {
    console.error('Database operation error', err.stack);
  })
  .finally(() => {
    client.end();
  });
