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