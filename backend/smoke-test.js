const assert = require('node:assert/strict');

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@shop.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const SHIPPING_ADDRESS = {
  fullName: 'Test User',
  address: '12 Main Street',
  city: 'Dar es Salaam',
  phone: '0700000000',
};

const roundMoney = (value) => Math.round(value * 100) / 100;

async function call(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

let passed = 0;
async function step(name, fn) {
  await fn();
  passed += 1;
  console.log(`PASS  ${name}`);
}

async function runAccountSteps(ctx) {
  const registration = { name: 'Test User', email: ctx.email, password: ctx.password };

  await step('health check', async () => {
    const r = await call('GET', '/health');
    assert.equal(r.status, 200);
    assert.equal(r.data.status, 'ok');
  });

  await step('register a new user', async () => {
    const r = await call('POST', '/auth/register', registration);
    assert.equal(r.status, 201);
    assert.ok(r.data.token);
    assert.equal(r.data.role, 'user');
  });

  await step('duplicate and invalid registrations are rejected', async () => {
    const duplicate = await call('POST', '/auth/register', registration);
    assert.equal(duplicate.status, 409);
    const invalid = await call('POST', '/auth/register', {
      ...registration,
      email: 'not-an-email',
    });
    assert.equal(invalid.status, 400);
  });

  await step('login with a wrong password fails', async () => {
    const r = await call('POST', '/auth/login', {
      email: ctx.email,
      password: 'wrong-password',
    });
    assert.equal(r.status, 401);
  });

  await step('login with the right password works', async () => {
    const r = await call('POST', '/auth/login', {
      email: ctx.email,
      password: ctx.password,
    });
    assert.equal(r.status, 200);
    assert.ok(r.data.token);
    ctx.token = r.data.token;
  });
}