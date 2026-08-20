require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
// Cloud hosts like Render assign a PORT dynamically, so we must use process.env.PORT
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Cloud Database (Supabase)
// It uses the environment variable if available (for Render), or the fallback string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres.fdlpaolzdtpkrichitzn:dharmaraj2026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to Cloud PostgreSQL Database!'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

// GET — View all submissions in browser
app.get('/api/website-demo', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM website ORDER BY created_at DESC');
    const rows = result.rows;
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
      <h1>📋 Institute 360 — Demo Requests <span class="badge">Cloud DB</span></h1>
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
            <td>${new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>`).join('')}
      </table>
    </body>
    </html>`;
    res.send(html);
  } catch (err) {
    console.error('DB read error:', err.message);
    res.status(500).json({ error: 'Failed to fetch data.' });
  }
});

// POST — Save a new demo request to Cloud DB
app.post('/api/website-demo', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, institute_name, students_count, institute_type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO website (first_name, last_name, email, phone, institute_name, students_count, institute_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [first_name, last_name, email, phone, institute_name, students_count, institute_type]
    );
    
    console.log('✅ New submission saved! ID:', result.rows[0].id);
    res.status(201).json({ message: 'Demo request saved successfully!', id: result.rows[0].id });
  } catch (err) {
    console.error('DB write error:', err.message);
    res.status(500).json({ error: 'Failed to save data.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('✅ Server running on port', PORT);
});
