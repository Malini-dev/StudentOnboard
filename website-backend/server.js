const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database Setup (auto-creates institute360.db file in this folder)
const db = new Database(path.join(__dirname, 'institute360.db'));

// Create the 'website' table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS website (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    institute_name TEXT,
    students_count TEXT,
    institute_type TEXT
  )
`);
console.log('✅ SQLite Database connected! Table "website" is ready.');

// GET endpoint — view all saved demo requests in browser
app.get('/api/website-demo', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM website ORDER BY created_at DESC').all();
    let html = `
    <html>
    <head>
      <title>Institute 360 - Demo Requests</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        h1 { color: #5b2fc9; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th { background: #5b2fc9; color: white; padding: 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #f0ebff; }
        .count { color: #666; margin-bottom: 10px; }
        .empty { text-align:center; padding: 30px; color: #888; }
        .refresh { display:inline-block; margin-left:10px; padding:5px 15px; background:#5b2fc9; color:white; text-decoration:none; border-radius:5px; font-size:14px; }
        .badge { display:inline-block; padding:3px 10px; background:#10b981; color:white; border-radius:12px; font-size:12px; margin-left:8px; }
      </style>
    </head>
    <body>
      <h1>📋 Institute 360 — Demo Requests <span class="badge">SQLite DB</span></h1>
      <p class="count">Total submissions: <strong>${rows.length}</strong> <a class="refresh" href="/api/website-demo">🔄 Refresh</a></p>
      <table>
        <tr>
          <th>#</th><th>First Name</th><th>Last Name</th><th>Email</th>
          <th>Phone</th><th>Institute</th><th>Students</th><th>Type</th><th>Date</th>
        </tr>
        ${rows.length === 0 
          ? '<tr><td colspan="9" class="empty">No submissions yet. Submit the form to see data here!</td></tr>'
          : rows.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.first_name || ''}</td>
            <td>${r.last_name || ''}</td>
            <td>${r.email || ''}</td>
            <td>${r.phone || ''}</td>
            <td>${r.institute_name || ''}</td>
            <td>${r.students_count || ''}</td>
            <td>${r.institute_type || ''}</td>
            <td>${r.created_at || ''}</td>
          </tr>`).join('')}
      </table>
    </body>
    </html>`;
    res.send(html);
  } catch (err) {
    console.error('DB read error:', err);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
});

// POST endpoint — save demo request to SQLite
app.post('/api/website-demo', (req, res) => {
  try {
    const { first_name, last_name, email, phone, institute_name, students_count, institute_type } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO website (first_name, last_name, email, phone, institute_name, students_count, institute_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(first_name, last_name, email, phone, institute_name, students_count, institute_type);
    console.log('✅ New submission saved! ID:', result.lastInsertRowid, '| Name:', first_name, last_name);
    res.status(201).json({ message: 'Demo request saved successfully!', id: result.lastInsertRowid });
  } catch (err) {
    console.error('DB write error:', err);
    res.status(500).json({ error: 'Failed to save data.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log('  ✅ Server running at http://localhost:' + PORT);
  console.log('  📋 View data at http://localhost:' + PORT + '/api/website-demo');
  console.log('  🗄️  Database: Local SQLite (institute360.db)');
  console.log('===========================================');
  console.log('');
});
