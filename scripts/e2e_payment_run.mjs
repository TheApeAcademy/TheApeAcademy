import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

function log(...args) { console.log(new Date().toISOString(), ...args); }

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, opts).catch(e => { throw new Error(`Fetch error ${e.message}`); });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
  return { status: res.status, body: json, headers: Object.fromEntries(res.headers.entries()) };
}

async function run() {
  log('Checking health...');
  try {
    const h = await request('/api/health');
    log('Health:', h.status, h.body);
  } catch (e) {
    console.error('Health check failed:', e.message);
    process.exit(1);
  }

  const email = `e2e+${Date.now()}@example.com`;
  const password = 'Password123!';

  log('Signing up', email);
  const signup = await request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'E2E Tester', email, password, confirmPassword: password }),
  });
  log('Signup response:', signup.status, signup.body);
  if (signup.status >= 400) process.exit(1);

  log('Logging in');
  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  log('Login response:', login.status, login.body);
  if (login.status >= 400) process.exit(1);

  const token = login.body.token;
  if (!token) {
    console.error('No token returned');
    process.exit(1);
  }

  log('Initiating payment (NGN 100)');
  const init = await request('/api/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount: 100, currency: 'NGN' }),
  });
  log('Initiate response:', init.status, init.body);
  if (init.status >= 400) process.exit(1);

  const checkoutUrl = init.body.checkoutUrl || init.body.paymentLink || (init.body.payment && init.body.payment.checkoutUrl);
  if (checkoutUrl) {
    log('Checkout URL:', checkoutUrl);
    // Save to file for quick copy/paste
    fs.writeFileSync('./e2e_last_checkout_url.txt', checkoutUrl);
    log('Saved checkout URL to e2e_last_checkout_url.txt');
  } else {
    log('No checkout URL returned, response body saved to e2e_initiate.json');
    fs.writeFileSync('./e2e_initiate.json', JSON.stringify(init.body, null, 2));
  }

  log('E2E script finished. Open the checkout URL in a browser to complete payment and watch the webhook logs.');
}

run().catch(e => { console.error('E2E run failed:', e); process.exit(1); });
