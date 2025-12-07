// backend/src/shared/database/db.js
const { Pool } = require('pg');

// ⚙️ CREDENCIALES CONFIGURADAS
const pool = new Pool({
  user: process.env.DB_USER,      
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prueba de conexión al iniciar
pool.connect()
  .then(client => {
    console.log('✅ Conexión a PostgreSQL establecida con éxito.');
    client.release();
  })
  .catch(err => {
    // Detiene la aplicación si no hay conexión a la base de datos
    console.error('❌ Error CRÍTICO de conexión a PostgreSQL:', err.stack);
    process.exit(1); 
  });

module.exports = {
  /** Función estándar para ejecutar consultas SQL */
  query: (text, params) => pool.query(text, params),
  
  /** Para transacciones (BEGIN/COMMIT) */
  getClient: () => pool.connect(),
  
  pool: pool
};