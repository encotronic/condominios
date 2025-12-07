// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ⚠️ IMPORTANTE: Asegurarse de que el archivo de conexión a la BD se ejecute
// Esto iniciará la prueba de conexión a PostgreSQL
require('./shared/database/db'); 

// 1. Inicialización de Express
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middlewares Globales
app.use(cors()); 
app.use(express.json()); 

// 3. Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Condominio Manager API V2 - Running',
    database: 'PostgreSQL V2 Schema Loaded'
  });
});

// 4. Montaje de Módulos (Se agregará aquí en el siguiente paso)
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/condo', require('./modules/condo/condo.routes'));
//app.use('/api/units', require('./modules/units/unit.routes'));
app.use('/api/billing', require('./modules/billing/billing.routes'));
app.use('/api/payments', require('./modules/payments/payment.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));

// 5. Encender el Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});