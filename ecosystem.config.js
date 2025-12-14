/**
 * PM2 ecosystem file to run frontend and backend in development persistently.
 * Usage:
 *   npm i -g pm2
 *   pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'condo-frontend',
      // On Windows run via cmd.exe so pm2 doesn't try to parse npm.cmd as JS
      script: 'cmd',
      // Run production start so the server is stable under PM2
      args: '/c npm run start:prod',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
      },
      exec_interpreter: 'none',
      autorestart: true,
      watch: false
    },
    {
      name: 'condo-backend',
      script: 'node',
      args: 'src/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      watch: false
    }
  ]
};
