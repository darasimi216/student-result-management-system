const fetch = require('node-fetch');
const fs = require('fs');

const API = process.env.API_URL || 'http://localhost:5000/api';
const teacher = { email: 'teacher@example.com', password: 'password123' };

(async function run() {
  try {
    console.log('1) Check server health (GET /results without auth)');
    let res = await fetch(`${API}/results`);
    console.log('   Status (expected 401 or 200 if public):', res.status);

    console.log('2) Login as teacher');
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error('Login failed: ' + err);
    }

    const data = await res.json();
    const token = data.token;
    console.log('   Logged in, token length:', token ? token.length : 0);

    console.log('3) Create a result');
    res = await fetch(`${API}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ studentName: 'Smoketest Student', score: 88, subject: 'Math' })
    });

    if (!res.ok) {
      throw new Error('Create result failed: ' + await res.text());
    }

    const created = await res.json();
    console.log('   Created result id:', created._id);

    console.log('4) Update the created result (change score to 92)');
    res = await fetch(`${API}/results/${created._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ score: 92 })
    });

    if (!res.ok) {
      throw new Error('Update failed: ' + await res.text());
    }

    const updated = await res.json();
    console.log('   Updated score:', updated.score, 'grade:', updated.grade, 'status:', updated.status);

    console.log('5) Export CSV');
    res = await fetch(`${API}/results/export/csv`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('CSV export failed: ' + res.status);
    const csvBuf = await res.buffer();
    fs.writeFileSync('./exports/smoke-results.csv', csvBuf);
    console.log('   CSV saved to ./exports/smoke-results.csv');

    console.log('6) Export PDF');
    res = await fetch(`${API}/results/export/pdf`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw new Error('PDF export failed: ' + res.status);
    const pdfBuf = await res.buffer();
    fs.writeFileSync('./exports/smoke-results.pdf', pdfBuf);
    console.log('   PDF saved to ./exports/smoke-results.pdf');

    console.log('7) Get stats summary');
    res = await fetch(`${API}/results/stats/summary`, { headers: { 'Authorization': `Bearer ${token}` } });
    const stats = await res.json();
    console.log('   Stats:', stats);

    console.log('\nSmoke test completed successfully.');
  } catch (err) {
    console.error('Smoke test error:', err.message || err);
    process.exitCode = 2;
  }
})();
