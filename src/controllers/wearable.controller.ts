import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import wearableService, { WearableProvider } from '../services/wearable.service';

const VALID_PROVIDERS: WearableProvider[] = ['fitbit', 'garmin', 'google_fit', 'healthkit', 'whoop', 'oura'];

const validateProvider = (provider: string): provider is WearableProvider =>
  VALID_PROVIDERS.includes(provider as WearableProvider);

// ── Get all connections ────────────────────────────────────────────────────

export const getConnections = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const connections = await wearableService.getConnections(req.user!.id);
    res.json({ success: true, connections });
  } catch (err) {
    next(err);
  }
};

// ── Start OAuth flow ───────────────────────────────────────────────────────

export const initiateOAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider } = req.params;

    if (!validateProvider(provider)) {
      res.status(400).json({ error: `Proveedor inválido. Opciones: ${VALID_PROVIDERS.join(', ')}` });
      return;
    }

    const authUrl = wearableService.getOAuthUrl(provider, req.user!.id);
    res.json({ success: true, authUrl });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ── OAuth callback ─────────────────────────────────────────────────────────

export const oauthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      res.redirect(`/wearables.html?error=${encodeURIComponent(String(error))}`);
      return;
    }

    if (!validateProvider(provider) || !code || !state) {
      res.redirect('/wearables.html?error=invalid_callback');
      return;
    }

    const { userId } = await wearableService.handleOAuthCallback(
      provider,
      String(code),
      String(state),
    );

    res.redirect(`/wearables.html?connected=${provider}&success=true`);
  } catch (err: any) {
    res.redirect(`/wearables.html?error=${encodeURIComponent(err.message)}`);
  }
};

// ── Manual sync ────────────────────────────────────────────────────────────

export const syncData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { synced, errors } = await wearableService.syncUser(req.user!.id);
    res.json({
      success: true,
      message: `Sincronización completada`,
      synced,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// ── HealthKit push (from iOS app) ──────────────────────────────────────────

export const pushHealthKitData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      steps,
      heartRate,
      heartRateResting,
      sleepMinutes,
      sleepQuality,
      caloriesBurned,
      activeMinutes,
      vo2Max,
      hrv,
      spo2,
      date,
    } = req.body;

    await wearableService.storeHealthKitData(req.user!.id, {
      steps,
      heartRate,
      heartRateResting,
      sleepMinutes,
      sleepQuality,
      caloriesBurned,
      activeMinutes,
      vo2Max,
      hrv,
      spo2,
      date: date ? new Date(date) : new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ── Disconnect provider ────────────────────────────────────────────────────

export const disconnect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider } = req.params;

    if (!validateProvider(provider)) {
      res.status(400).json({ error: 'Proveedor inválido' });
      return;
    }

    await wearableService.disconnectProvider(req.user!.id, provider);
    res.json({ success: true, message: `${provider} desconectado correctamente` });
  } catch (err) {
    next(err);
  }
};
