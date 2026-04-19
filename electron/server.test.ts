// @vitest-environment node
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './server';

describe('GET /hello', () => {
  it('returns 200 with a message', async () => {
    const res = await request(app).get('/hello');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello from Express!' });
  });
});
