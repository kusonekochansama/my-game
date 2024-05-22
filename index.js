const express = require('express');
const cors = require('cors'); // 追加
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // 追加

// PostgreSQL接続設定
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.json());

app.get('/api/highscores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM highscores ORDER BY score DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Database operation error' });
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
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Database operation error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
