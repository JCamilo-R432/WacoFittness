import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: { service: 'wacocoach' },
  transports: [
    // Errores en archivo separado con rotación
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,  // 5 MB
      maxFiles: 5,
      tailable: true,
    }),
    // Todos los logs combinados con rotación
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10,
      tailable: true,
    }),
    // Consola solo fuera de producción
    ...(process.env.NODE_ENV !== 'production'
      ? [new winston.transports.Console({
          format: combine(colorize(), simple()),
        })]
      : []),
  ],
});

/** Stream para Morgan (HTTP request logging) */
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
