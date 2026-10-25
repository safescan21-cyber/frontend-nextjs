// PM2 setup for the live site (VPS): one copy of the Next.js server per CPU core (2),
// sharing port 3001 behind nginx. It runs /var/www/frontend-live, a link to the current
// release in /var/www/frontend-releases (scripts/deploy.sh builds elsewhere and switches it).
//   first start / after editing this file:  pm2 delete foodpharma-next; pm2 start ecosystem.config.cjs; pm2 save
//   deploys: scripts/deploy.sh (pm2 reload, one copy at a time)
module.exports = {
  apps: [
    {
      name: 'foodpharma-next',
      cwd: '/var/www/frontend-live',
      script: 'server.js',
      exec_mode: 'cluster',
      instances: 2,
      // A copy that grows past this is restarted (the other keeps serving)
      max_memory_restart: '1500M',
      env: { NODE_ENV: 'production', PORT: 3001, HOSTNAME: '127.0.0.1' },
    },
  ],
};
