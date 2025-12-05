const request = require('supertest');
const express = require('express');
const router = require('../routes/auth');

const app = new express();
app.use('/', router);

describe('Test Auth Routes', function () {

  test('responds to /logout', async () => {
    const res = await request(app).post('/logout');
    expect(res.header['content-type']).toBe('application/json; charset=utf-8');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toEqual('Logged out successfully');
  });

});