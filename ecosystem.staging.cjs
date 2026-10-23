// PM2 setup for the staging copy (https://next.foodpharmamachinery.com): one small Next.js
// server on port 3002 from /var/www/frontend-staging. Started and updated by scripts/stage.sh.
module.exports = {
  apps: [
    {
      name: 'foodpharma-staging',
      cwd: '/var/www/frontend-staging/.next/standalone',
      script: 'server.js',
      instances: 1,
      max_memory_restart: '800M',
      env: { NODE_ENV: 'production', PORT: 3002, HOSTNAME: '127.0.0.1' },
    },
  ],
};
