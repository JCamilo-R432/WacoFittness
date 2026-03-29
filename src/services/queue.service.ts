/**
 * Queue Service con Bull + Redis.
 * Si Redis no está disponible, ejecuta los jobs de forma síncrona (desarrollo).
 */
import Queue from 'bull';
import emailService from './email.service';

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_HOST
  ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
  : undefined;

type JobHandler<T = any> = (data: T) => Promise<void>;

// ── Fallback sin Redis ─────────────────────────────────────────────────────
class SyncQueue {
  private name: string;
  constructor(name: string) { this.name = name; }
  async add(type: string, data: any) {
    console.log(`[Queue:${this.name}] Ejecutando ${type} síncronamente (sin Redis)`);
    // Se maneja en el procesador registrado
  }
  process(_type: string, handler: JobHandler) {
    // No-op en modo sync — el caller ejecuta directamente
  }
}

// ── Queue real con Bull ────────────────────────────────────────────────────
function createQueue(name: string) {
  if (!REDIS_URL) {
    console.warn(`[Queue] Redis no configurado — usando modo síncrono para cola "${name}"`);
    return null;
  }
  return new Queue(name, REDIS_URL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
}

// ── Definición de colas ────────────────────────────────────────────────────
export const emailQueue = createQueue('emails');
export const notificationQueue = createQueue('notifications');
export const analyticsQueue = createQueue('analytics');

// ── Workers ───────────────────────────────────────────────────────────────
if (emailQueue) {
  emailQueue.process('welcome', async (job) => {
    const { to, name } = job.data;
    await emailService.sendWelcome(to, name);
  });

  emailQueue.process('password-reset', async (job) => {
    const { to, name, token } = job.data;
    await emailService.sendPasswordReset(to, name, token);
  });

  emailQueue.process('payment-success', async (job) => {
    const { to, name, planName, amount, receiptUrl } = job.data;
    await emailService.sendPaymentSuccess(to, name, planName, amount, receiptUrl);
  });

  emailQueue.process('payment-failed', async (job) => {
    const { to, name, planName } = job.data;
    await emailService.sendPaymentFailed(to, name, planName);
  });

  emailQueue.process('subscription-canceled', async (job) => {
    const { to, name, endDate } = job.data;
    await emailService.sendSubscriptionCanceled(to, name, endDate);
  });

  emailQueue.process('2fa-backup-codes', async (job) => {
    const { to, name, codes } = job.data;
    await emailService.send2FABackupCodes(to, name, codes);
  });

  emailQueue.on('failed', (job, err) => {
    console.error(`[EmailQueue] Job ${job.name} falló:`, err.message);
  });
}

// ── Helpers de dispatch ────────────────────────────────────────────────────
export const dispatchEmail = async (type: string, data: object): Promise<void> => {
  if (emailQueue) {
    await emailQueue.add(type, data);
  } else {
    // Modo síncrono para desarrollo
    switch (type) {
      case 'welcome':
        await emailService.sendWelcome((data as any).to, (data as any).name);
        break;
      case 'password-reset':
        await emailService.sendPasswordReset((data as any).to, (data as any).name, (data as any).token);
        break;
      case 'payment-success':
        await emailService.sendPaymentSuccess(
          (data as any).to, (data as any).name, (data as any).planName,
          (data as any).amount, (data as any).receiptUrl,
        );
        break;
      case 'payment-failed':
        await emailService.sendPaymentFailed((data as any).to, (data as any).name, (data as any).planName);
        break;
      case '2fa-backup-codes':
        await emailService.send2FABackupCodes((data as any).to, (data as any).name, (data as any).codes);
        break;
    }
  }
};
