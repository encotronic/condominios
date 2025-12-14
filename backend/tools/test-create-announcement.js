const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const authService = require('../src/modules/auth/services/auth.service');
const announcementService = require('../src/modules/announcements/services/announcement.service');
const jwt = require('jsonwebtoken');

(async () => {
  try {
    console.log('Logging in via authService...');
    const loginResult = await authService.login({ email: 'admin@test.com', password: 'password' });
    console.log('Login OK, token head:', loginResult.token && loginResult.token.substring(0,20));
    const decoded = jwt.verify(loginResult.token, process.env.JWT_SECRET);
    console.log('Decoded token:', { id: decoded.id, role: decoded.role, condoId: decoded.condoId });

    const created = await announcementService.create({
      condominiumId: decoded.condoId,
      authorId: decoded.id,
      title: 'E2E test via service',
      content: 'Creado por script de prueba directo (service).',
      visibility: 'BUILDING',
      startAt: null,
      endAt: null,
      pinned: false
    });

    console.log('Announcement created:', created.id || created);
    process.exit(0);
  } catch (err) {
    console.error('ERROR in test-create-announcement:', err && err.message ? err.message : err);
    console.error(err && err.stack ? err.stack : '');
    process.exit(1);
  }
})();
