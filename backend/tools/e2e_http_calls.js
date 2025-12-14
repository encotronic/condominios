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
        const text = chunks || '';
        try {
          const json = text ? JSON.parse(text) : null;
          resolve({ status: res.statusCode, body: json });
        } catch (err) {
          resolve({ status: res.statusCode, body: text });
        }
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

    console.log('\n1) GET /api/auth/condominiums');
    const cRes = await httpRequest('GET', '/api/auth/condominiums', token);
    console.log('Status:', cRes.status);
    console.log('Body:', cRes.body);

    console.log('\n2) GET /api/billing/charges (default)');
    const chDefault = await httpRequest('GET', '/api/billing/charges', token);
    console.log('Status:', chDefault.status);
    console.log('Body:', chDefault.body);

    console.log('\n3) GET /api/billing/charges?condominiumId=123 (override)');
    const chOverride = await httpRequest('GET', '/api/billing/charges?condominiumId=123', token);
    console.log('Status:', chOverride.status);
    console.log('Body:', chOverride.body);

    console.log('\n3b) GET /api/billing/charges?condominiumId=<token.condoId> (valid override to trigger audit)');
    const validOverridePath = `/api/billing/charges?condominiumId=${decoded.condoId}`;
    const chValidOverride = await httpRequest('GET', validOverridePath, token);
    console.log('Status:', chValidOverride.status);
    console.log('Body:', chValidOverride.body);

    console.log('\n4) POST /api/announcements (create with token condoId)');
    const annBody = { title: 'E2E HTTP Test', content: 'Creado por e2e_http_calls.js', condominiumId: decoded.condoId };
    const annRes = await httpRequest('POST', '/api/announcements', token, annBody);
    console.log('Status:', annRes.status);
    console.log('Body:', annRes.body);

    console.log('\nAll done.');
    process.exit(0);
  } catch (err) {
    console.error('E2E script error:', err && err.message ? err.message : err);
    console.error(err && err.stack ? err.stack : '');
    process.exit(1);
  }
})();
