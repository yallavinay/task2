const request = require('supertest');
const app = require('../server');

describe('GET /api/message', () => {
  it('returns the expected JSON message', async () => {
    const response = await request(app).get('/api/message');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello i am vinay Currently purssing b tech in ECE' });
  });
});
