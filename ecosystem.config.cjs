// PM2 setup for the live site (VPS, /var/www/frontend-next): one copy of the Next.js
// server per CPU core (2), sharing port 3001 behind nginx.
//   first start / after editing this file:  pm2 delete foodpharma-next; pm2 start ecosystem.config.cjs; pm2 save
//   after each deploy (no downtime, one copy at a time):  pm2 reload foodpharma-next
module.exports = {
  apps: [
    {
      name: 'foodpharma-next',
      cwd: '/var/www/frontend-next/.next/standalone',
      script: 'server.js',
      exec_mode: 'cluster',
      instances: 2,
      // A copy that grows past this is restarted (the other keeps serving)
      max_memory_restart: '1500M',
      env: { NODE_ENV: 'production', PORT: 3001, HOSTNAME: '127.0.0.1' },
    },
  ],
};
