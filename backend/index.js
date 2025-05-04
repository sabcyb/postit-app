//
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./notes.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite DB');
  });
  
  // Create table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      x INTEGER,
      y INTEGER
    )
  `);
  
  // Routes
  app.get('/notes', (req, res) => {
    db.all('SELECT * FROM notes', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  app.post('/notes', (req, res) => {
    const { content, x, y } = req.body;
    db.run(`INSERT INTO notes (content, x, y) VALUES (?, ?, ?)`,
      [content, x, y],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      });
  });
  
  app.put('/notes/:id', (req, res) => {
    const { content, x, y } = req.body;
    db.run(
      `UPDATE notes SET content = ?, x = ?, y = ? WHERE id = ?`,
      [content, x, y, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
      }
    );
  });
  
  app.delete('/notes/:id', (req, res) => {
    db.run(`DELETE FROM notes WHERE id = ?`, req.params.id, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });