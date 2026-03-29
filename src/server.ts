import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { createServer } from 'http';
import app from './app';
import prisma from './config/database';
import { initWebSocket } from './services/websocket.service';

// ── Sentry Monitoring ──────────────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });
  console.log('✅ Sentry monitoring inicializado');
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a Supabase establecida correctamente.');

    // Create HTTP server (required for Socket.io)
    const httpServer = createServer(app);

    // Initialize WebSocket server
    const io = initWebSocket(httpServer);
    console.log('✅ WebSocket (Socket.io) inicializado');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor de WacoPro Fitness corriendo en: http://localhost:${PORT}`);
      console.log(`📌 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai`);
      console.log(`⌚ Wearables API: http://localhost:${PORT}/api/wearables`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} recibido. Cerrando servidor...`);
      httpServer.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
