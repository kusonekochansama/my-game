const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS設定を追加
app.use(cors({
    origin: 'http://nyandaru.starfree.jp' // 許可するオリジンを指定
}));

app.use(bodyParser.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.get('/api/highscores', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.post('/api/highscores', async (req, res) => {
    const { name, score } = req.body;
    try {
        await pool.query('INSERT INTO highscores (name, score) VALUES ($1, $2)', [name, score]);
        const result = await pool.query('SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
