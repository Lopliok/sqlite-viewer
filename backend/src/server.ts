import express, { Request, Response, NextFunction } from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface AuthenticatedRequest extends Request {
    randomNum?: number;
}

interface UpdateData {
    id: number;
    changes: Record<string, any>;
}

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
const authenticateDB: any = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { dbName, password } = req.body;
    const passwordFile = path.join(DATA_DIR, `${dbName}.txt`);
    const dbFile = path.join(DATA_DIR, `${dbName}.sqlite`);

    try {
        if (!fs.existsSync(passwordFile)) {
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
app.post('/api/login', authenticateDB, (req: AuthenticatedRequest, res: Response) => {
    const { dbName } = req.body;
    const dbFile = path.join(DATA_DIR, `${dbName}.sqlite`);

    if (!fs.existsSync(dbFile)) {
        const db = new sqlite3.Database(dbFile);
        db.close();
    }

    res.json({ 
        success: true, 
        randomNum: req.randomNum
    });
});

// Get tables endpoint
app.post('/api/tables', authenticateDB, (req: Request, res: Response) => {
    const { dbName } = req.body;
    const db = new sqlite3.Database(path.join(DATA_DIR, `${dbName}.sqlite`));

    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables: any[]) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ tables: tables.map(t => t.name) });
    });
    db.close();
});

// Get table data endpoint
app.post('/api/table-data', authenticateDB, async (req: Request, res: Response) => {
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
app.post('/api/update-data', authenticateDB, (req: Request, res: Response) => {
    const { dbName, tableName, updates }: { dbName: string; tableName: string; updates: UpdateData[] } = req.body;
    const db = new sqlite3.Database(path.join(DATA_DIR, `${dbName}.sqlite`));

    try {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            updates.forEach((update) => {
                console.log(update);
                const setClauses = Object.keys(update)
                    .map(key => `${key} = ?`)
                    .join(', ');
                const values = [...Object.values(update), update.id];
                
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
    } catch (error: any) {
        db.run('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        db.close();
    }
});

// Start the server fdsafsdf dsf
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});