const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Set up data directory
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Authentication middleware
const authenticateDB = async (req, res, next) => {
    const { dbName, password } = req.body;
    const passwordFile = path.join(DATA_DIR, `${dbName}.txt`);
    const dbFile = path.join(DATA_DIR, `${dbName}.sqlite`);

    try {
        if (!fs.existsSync(passwordFile)) {
            // INIT case - create password file with random number
            const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
            fs.writeFileSync(passwordFile, password);
            req.randomNum = randomNum;
            return next();
        }

        const storedPassword = fs.readFileSync(passwordFile, 'utf8').trim();
        if (password !== storedPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Login endpoint
app.post('/api/login', authenticateDB, (req, res) => {
    const { dbName } = req.body;
    const dbFile = path.join(DATA_DIR, `${dbName}.sqlite`);

    if (!fs.existsSync(dbFile)) {
        const db = new sqlite3.Database(dbFile);
        db.close();
    }

    res.json({ 
        success: true, 
        randomNum: req.randomNum // Will be undefined if not INIT case
    });
});

// Get tables endpoint
app.post('/api/tables', authenticateDB, (req, res) => {
    const { dbName } = req.body;
    const db = new sqlite3.Database(path.join(DATA_DIR, `${dbName}.sqlite`));

    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ tables: tables.map(t => t.name) });
    });
    db.close();
});

// Get table data endpoint
app.post('/api/table-data', authenticateDB, (req, res) => {
    const { dbName, tableName } = req.body;
    const db = new sqlite3.Database(path.join(DATA_DIR, `${dbName}.sqlite`));

    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
    db.close();
});

// Update table data endpoint
app.post('/api/update-data', authenticateDB, (req, res) => {
    const { dbName, tableName, updates } = req.body;
    const db = new sqlite3.Database(path.join(DATA_DIR, `${dbName}.sqlite`));

    try {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            updates.forEach(update => {
                const setClauses = Object.keys(update.changes)
                    .map(key => `${key} = ?`)
                    .join(', ');
                const values = [...Object.values(update.changes), update.id];
                
                db.run(
                    `UPDATE ${tableName} SET ${setClauses} WHERE rowid = ?`,
                    values
                );
            });

            db.run('COMMIT', err => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ success: true });
            });
        });
    } catch (error) {
        db.run('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});