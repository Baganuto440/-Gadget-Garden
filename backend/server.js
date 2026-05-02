const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS masters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        specialty TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        device_type TEXT,
        problem_description TEXT,
        master_id INTEGER,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get(`SELECT COUNT(*) as cnt FROM masters`, (err, row) => {
        if (row.cnt === 0) {
            const insert = db.prepare(`INSERT INTO masters (name, phone, specialty) VALUES (?, ?, ?)`);
            insert.run('Алексей Гринёв', '+7 (916) 123-45-67', 'Смартфоны, ноутбуки');
            insert.run('Екатерина Вертова', '+7 (903) 123-44-55', 'Аксессуары, пайка');
            insert.run('Дмитрий Садовников', '+7 (926) 456-78-90', 'Mac, диагностика');
            insert.run('Марина Зеленина', '+7 (495) 123-45-67', 'iPhone, планшеты');
            insert.finalize();
        }
    });
});

app.get('/api/masters', (req, res) => {
    db.all(`SELECT id, name, phone, specialty FROM masters`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/requests', (req, res) => {
    const { client_name, client_phone, device_type, problem_description, master_id } = req.body;
    if (!client_name || !client_phone) {
        return res.status(400).json({ error: 'Имя и телефон обязательны' });
    }
    db.run(
        `INSERT INTO requests (client_name, client_phone, device_type, problem_description, master_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [client_name, client_phone, device_type, problem_description, master_id || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Заявка принята' });
        }
    );
});

app.listen(PORT, () => {
    console.log(`✅ Бэкенд запущен: http://localhost:${PORT}`);
    console.log(`🌐 Фронтенд доступен по адресу: http://localhost:${PORT}`);
    console.log(`📡 API: GET /api/masters | POST /api/requests`);
});