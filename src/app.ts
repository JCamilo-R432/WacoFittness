import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Middlewares
import { errorHandler } from './middleware/errorHandler';

// ── Phase 1 & 2 Routes ────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import nutritionRoutes from './routes/nutrition.routes';
import trainingRoutes from './routes/training.routes';
import supplementRoutes from './routes/supplement.routes';
import hydrationRoutes from './routes/hydration.routes';
import restRoutes from './routes/rest.routes';
import shoppingRoutes from './routes/shopping.routes';
import notificationRoutes from './routes/notifications.routes';
import socialRoutes from './routes/social.routes';
import analyticsRoutes from './routes/analytics.routes';

// ── Phase 3 Routes ────────────────────────────────────────────────────────
import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';
import securityRoutes from './routes/security.routes';
import adminRoutes from './routes/admin.routes';

// ── Phase 4 Routes ────────────────────────────────────────────────────────
import aiRoutes from './routes/ai.routes';
import aiCoachRoutes from './routes/aiCoach.routes';
import wearableRoutes from './routes/wearable.routes';

// ── Phase 5 Routes ────────────────────────────────────────────────────────
import enterpriseRoutes from './routes/enterprise.routes';
import billingEnterpriseRoutes from './routes/billing.routes';
import complianceRoutes from './routes/compliance.routes';
import growthRoutes from './routes/growth.routes';

// ── Phase 6 Routes — Home Fitness Platform ────────────────────────────────
import virtualClassRoutes from './routes/virtualClass.routes';
import programRoutes from './routes/program.routes';
import progressRoutes from './routes/progress.routes';
import challengeRoutes from './routes/challenge.routes';
import videoRoutes from './routes/video.routes';
import coachingRoutes from './routes/coaching.routes';

// ── Phase 7 Routes — New Features ─────────────────────────────────────────
import periodizedPlanRoutes from './routes/periodizedPlan.routes';
import recoveryMetricsRoutes from './routes/recoveryMetrics.routes';
import settingsRoutes from './routes/settings.routes';
import backupRoutes from './routes/backup.routes';
import shopRoutes from './routes/shop.routes';
import mealDeliveryRoutes from './routes/mealDelivery.routes';

dotenv.config();

const app = express();

console.log('🚀 Iniciando configuración de Express...');

// ── Compresión Gzip/Brotli ────────────────────────────────────────────────
app.use(compression());

// ── Seguridad ─────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim());
    if (allowed.includes('*') || !origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas peticiones. Intenta en 15 minutos.', code: 'RATE_LIMIT' },
});
app.use('/api', globalLimiter);

// Rate limiting estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Demasiados intentos de autenticación.', code: 'AUTH_RATE_LIMIT' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

console.log('✅ Seguridad configurada (Helmet + CORS + Rate Limiting)');

// ── Webhooks (raw body ANTES del JSON parser) ─────────────────────────────
// Stripe requiere el body raw para verificar la firma del webhook
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

console.log('✅ Body parsers configurados');

// ── Archivos estáticos ────────────────────────────────────────────────────
const publicPath = path.join(__dirname, 'public');
// Assets estáticos con caché de 7 días (versioned assets: css, js, fonts, images)
app.use('/css', express.static(path.join(publicPath, 'css'), { maxAge: '7d' }));
app.use('/js', express.static(path.join(publicPath, 'js'), { maxAge: '7d' }));
app.use('/fonts', express.static(path.join(publicPath, 'fonts'), { maxAge: '30d' }));
app.use('/images', express.static(path.join(publicPath, 'images'), { maxAge: '7d' }));
// Locales — short cache, may update on deploy
app.use('/locales', express.static(path.join(publicPath, 'locales'), { maxAge: '1h' }));
// HTML sin caché (contenido dinámico)
app.use(express.static(publicPath, { maxAge: 0 }));
console.log('📁 Archivos estáticos desde:', publicPath);

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'WacoPro Fitness API is running',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Metrics (Prometheus) ──────────────────────────────────────────────────
app.get('/metrics', async (_req, res) => {
  try {
    const { register } = await import('prom-client');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch {
    res.status(500).send('Metrics not available');
  }
});

// ── API Routes ────────────────────────────────────────────────────────────
console.log('📌 Registrando rutas de API...');

// Phase 1 & 2
app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/supplements', supplementRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/rest', restRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/analytics', analyticsRoutes);

// Phase 3
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/admin', adminRoutes);

// Phase 4
app.use('/api/ai', aiRoutes);
app.use('/api/ai-coach', aiCoachRoutes);   // WacoCoach voice endpoint
app.use('/api/wearables', wearableRoutes);

// Phase 5
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/billing', billingEnterpriseRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/growth', growthRoutes);

// Phase 6 — Home Fitness
app.use('/api/classes', virtualClassRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/fitness-challenges', challengeRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/coaches', coachingRoutes);

// Phase 7 — New Features
app.use('/api/training-plans', periodizedPlanRoutes);
app.use('/api/recovery', recoveryMetricsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/meal-delivery', mealDeliveryRoutes);

console.log('✅ Todas las rutas registradas');

// ── Páginas frontend ──────────────────────────────────────────────────────
const htmlPages = [
  // Phase 1 & 2
  'login', 'register', 'dashboard', 'profile', 'forgot-password',
  'analytics', 'social-feed', 'workout-builder', 'meal-planner',
  'exercise-library', 'challenges',
  // Phase 3
  'pricing', 'billing', 'security-settings',
  'admin-dashboard', 'admin-users', 'admin-content', 'admin-analytics',
  // Phase 4
  'ai-coach', 'wearables',
  // Phase 5
  'enterprise-dashboard', 'org-settings', 'billing-enterprise', 'compliance-dashboard', 'ab-tests',
  // Phase 6 — Home Fitness
  'virtual-classes', 'programs', 'on-demand', 'progress-tracker',
  'fitness-challenges', 'coaches', 'home-equipment',
  // Phase 7 — New Features
  'periodized-plans', 'recovery', 'form-check', 'meal-delivery', 'shop',
];

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

htmlPages.forEach(page => {
  app.get(`/${page}`, (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', code: 'NOT_FOUND' });
});

// ── Error Handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

console.log('✅ Configuración de Express completada (v6.0.0 Home Fitness Platform)');

export default app;
