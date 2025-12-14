const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const authService = require('../src/modules/auth/services/auth.service');
const jwt = require('jsonwebtoken');
const http = require('http');

const BASE_HOST = 'localhost';
const BASE_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

function httpRequest(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };

    if (body) {
      const data = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => chunks += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: chunks ? JSON.parse(chunks) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: chunks }); }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    console.log('Login as admin@test.com ...');
    const loginResult = await authService.login({ email: 'admin@test.com', password: 'password' });
    const token = loginResult.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token obtained. Decoded:', { id: decoded.id, role: decoded.role, condoId: decoded.condoId });

    console.log('\nListing announcements (GET /api/announcements)');
    const res = await httpRequest('GET', '/api/announcements', token);
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    process.exit(0);
  } catch (err) {
    console.error('Error listing announcements:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
