// Simple debug helper to inspect DB env variables and types
console.log('Inspecting DB-related environment variables (values masked)');
const keys = ['DB_USER','DB_PASS','DB_NAME','DB_HOST','DB_PORT'];
keys.forEach(k => {
  const v = process.env[k];
  console.log(`${k}: type=${typeof v}, present=${v !== undefined}${v ? `, length=${String(v).length}` : ''}`);
});

// Optional: attempt to create a client config object (without connecting)
try {
  const cfg = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  };
  console.log('Config sample (password masked):', {
    user: cfg.user,
    host: cfg.host,
    database: cfg.database,
    port: cfg.port,
    password_present: typeof cfg.password === 'string' && cfg.password.length > 0,
  });
} catch (e) {
  console.error('Error building config:', e && e.message);
}

console.log('Run with: node backend/scripts/db_env_debug.js');
