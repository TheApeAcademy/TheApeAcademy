module.exports = {
  apps: [
    {
      name: 'apeacademy',
      script: './server/index.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist', 'uploads'],
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
      shutdown_with_message: true,
    },
  ],
  deploy: {
    production: {
      user: 'node',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-github-repo-url',
      path: '/var/www/apeacademy',
      'post-deploy':
        'npm install && npm run build && npm run db:migrate && pm2 restart ecosystem.config.cjs --env production',
    },
  },
};
