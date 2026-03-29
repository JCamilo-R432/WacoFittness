// ── PM2 Ecosystem Configuration — WacoPro Fitness ────────────────────────
// Uso:
//   pm2 start ecosystem.config.js --env production
//   pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'wacopro',
      script: 'dist/server.js',
      instances: 'max',          // Un proceso por core (cluster mode)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',

      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logs
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Reinicio automático
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Graceful shutdown: esperar que terminen los requests en vuelo
      kill_timeout: 10000,
      listen_timeout: 5000,
      shutdown_with_message: true,
    },
  ],
};
