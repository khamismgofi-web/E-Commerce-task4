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

async function runCatalogueSteps(ctx) {
  await step('list products with pagination', async () => {
    const r = await call('GET', '/products?limit=50');
    assert.equal(r.status, 200);
    assert.ok(r.data.products.length > 0, 'No products found. Run "npm run seed" first.');
    ctx.product = r.data.products.find((p) => p.stock >= 2);
    assert.ok(ctx.product, 'No product with stock of at least 2');
    ctx.stockBefore = ctx.product.stock;
  });

  await step('search, category and price filters work', async () => {
    const { product } = ctx;
    const keywordPath = `/products?keyword=${encodeURIComponent(product.name)}`;
    const byKeyword = await call('GET', keywordPath);
    assert.ok(byKeyword.data.products.some((p) => p._id === product._id));
    const categoryPath = `/products?category=${encodeURIComponent(product.category)}`;
    const byCategory = await call('GET', categoryPath);
    assert.ok(byCategory.data.products.every((p) => p.category === product.category));
    const badPrice = await call('GET', '/products?minPrice=abc');
    assert.equal(badPrice.status, 400);
  });
}

async function runCartSteps(ctx) {
  const { product, stockBefore, token } = ctx;

  await step('cart requires login', async () => {
    const r = await call('GET', '/cart');
    assert.equal(r.status, 401);
  });

  await step('add a product to the cart', async () => {
    const body = { productId: product._id, quantity: 2 };
    const r = await call('POST', '/cart', body, token);
    assert.equal(r.status, 201);
    assert.equal(r.data.items.length, 1);
    assert.equal(r.data.items[0].quantity, 2);
  });

  await step('adding more than the stock is rejected', async () => {
    const body = { productId: product._id, quantity: stockBefore + 1 };
    const r = await call('POST', '/cart', body, token);
    assert.equal(r.status, 400);
  });

  await step('update the cart quantity', async () => {
    const r = await call('PUT', `/cart/${product._id}`, { quantity: 1 }, token);
    assert.equal(r.status, 200);
    assert.equal(r.data.items[0].quantity, 1);
    assert.equal(r.data.total, roundMoney(product.price));
  });
}