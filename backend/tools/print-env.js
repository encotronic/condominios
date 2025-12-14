const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
console.log('Loaded .env from', path.resolve(__dirname, '..', '.env'));
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS type:', typeof process.env.DB_PASS);
console.log('DB_PASS value (masked):', process.env.DB_PASS ? ('******** (len=' + process.env.DB_PASS.length + ')') : process.env.DB_PASS);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
