import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/models/index.js';

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

const password = 'password123';

function registerUser(email) {
  return request(app)
    .post('/api/register')
    .send({ email, password, name: 'Test', lastname: 'User' });
}

describe('SportRental API', () => {
  it('lists fields (public)', async () => {
    const res = await request(app).get('/api/fields');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.rows)).toBe(true);
  });

  it('registers a user without leaking the password', async () => {
    const res = await registerUser(`u-${Date.now()}@example.com`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBeTruthy();
    expect(res.body.password).toBeUndefined();
  });

  it('rejects a duplicate email (400)', async () => {
    const email = `dup-${Date.now()}@example.com`;
    await registerUser(email);
    const res = await registerUser(email);
    expect(res.status).toBe(400);
  });

  it('logs in with correct password and returns a JWT', async () => {
    const email = `login-${Date.now()}@example.com`;
    await registerUser(email);
    const res = await request(app).post('/api/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects a wrong password (403)', async () => {
    const email = `wrong-${Date.now()}@example.com`;
    await registerUser(email);
    const res = await request(app).post('/api/login').send({ email, password: 'wrong-pass' });
    expect(res.status).toBe(403);
  });

  it('blocks protected routes without a token (403)', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(403);
  });

  it('allows protected routes with a valid token', async () => {
    const email = `auth-${Date.now()}@example.com`;
    await registerUser(email);
    const login = await request(app).post('/api/login').send({ email, password });
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
  });
});
