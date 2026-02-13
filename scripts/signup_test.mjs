import fetch from 'node-fetch';

async function signup(){
  const res = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Test User', email: 'test+webhook@example.com', password: 'password123', confirmPassword: 'password123' })
  });
  const json = await res.json().catch(async () => ({ raw: await res.text() }));
  console.log('STATUS', res.status);
  console.log(JSON.stringify(json, null, 2));
}

signup().catch(e=>{ console.error(e); process.exit(1) });
