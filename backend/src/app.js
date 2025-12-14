// backend/src/app.js
const path = require('path');
// Cargar .env desde la carpeta backend
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} else {
  // Durante tests dejamos que Jest controle las variables (o que se inyecten desde el entorno)
  try { require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); } catch (e) {}
}
const express = require('express');
const cors = require('cors');

// Sólo inicializar conexión a DB en entornos distintos a test para evitar dependencias externas
if (process.env.NODE_ENV !== 'test') {
  try { require('./shared/database/db'); } catch (e) { console.warn('[app] DB init skipped or failed:', e && e.message ? e.message : e); }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Condominio Manager API V2 - Running' });
});

// Montar rutas
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/condo', require('./modules/condo/condo.routes'));
app.use('/api/billing', require('./modules/billing/billing.routes'));
app.use('/api/payments', require('./modules/payments/payment.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));
app.use('/api/announcements', require('./modules/announcements/announcements.routes'));

// Rutas y utilidades específicas para tests
if (process.env.NODE_ENV === 'test') {
  try {
    const getTargetCondoId = require('./shared/utils/getTargetCondoId');
    app.post('/__test/resolve-condo', (req, res) => {
      if (req.body && req.body.user) req.user = req.body.user;
      const result = getTargetCondoId(req);
      res.status(200).json({ condoId: result });
    });

    // NOTE: removed test-only create-announcement route to use actual controller in integration tests
  } catch (e) {
    console.warn('[app] test route setup skipped:', e && e.message ? e.message : e);
  }
}

module.exports = app;
