import prisma from '../config/database';

export type WearableProvider = 'fitbit' | 'garmin' | 'google_fit' | 'healthkit' | 'whoop' | 'oura';

export interface WearableData {
  steps?: number;
  heartRate?: number;
  heartRateResting?: number;
  sleepMinutes?: number;
  sleepQuality?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  vo2Max?: number;
  hrv?: number;
  spo2?: number;
  stressScore?: number;
  date: Date;
}

// ── OAuth Config per provider ─────────────────────────────────────────────

const OAUTH_CONFIGS: Record<WearableProvider, {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
}> = {
  fitbit: {
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    scopes: ['activity', 'heartrate', 'sleep', 'profile'],
    clientIdEnv: 'FITBIT_CLIENT_ID',
    clientSecretEnv: 'FITBIT_CLIENT_SECRET',
  },
  garmin: {
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
    scopes: [],
    clientIdEnv: 'GARMIN_CLIENT_ID',
    clientSecretEnv: 'GARMIN_CLIENT_SECRET',
  },
  google_fit: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
    ],
    clientIdEnv: 'GOOGLE_FIT_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_FIT_CLIENT_SECRET',
  },
  healthkit: {
    // HealthKit uses native iOS SDK — no OAuth URL needed
    authUrl: '',
    tokenUrl: '',
    scopes: [],
    clientIdEnv: '',
    clientSecretEnv: '',
  },
  whoop: {
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    scopes: ['read:recovery', 'read:sleep', 'read:workout', 'read:profile', 'read:body_measurement'],
    clientIdEnv: 'WHOOP_CLIENT_ID',
    clientSecretEnv: 'WHOOP_CLIENT_SECRET',
  },
  oura: {
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    scopes: ['email', 'personal', 'daily'],
    clientIdEnv: 'OURA_CLIENT_ID',
    clientSecretEnv: 'OURA_CLIENT_SECRET',
  },
};

class WearableService {

  // ── OAuth Flow ─────────────────────────────────────────────────────────

  getOAuthUrl(provider: WearableProvider, userId: string): string {
    if (provider === 'healthkit') {
      throw new Error('HealthKit se conecta directamente desde la app iOS');
    }

    const config = OAUTH_CONFIGS[provider];
    const clientId = process.env[config.clientIdEnv];

    if (!clientId) {
      throw new Error(`${provider} no está configurado. Contacta al administrador.`);
    }

    const redirectUri = `${process.env.API_URL || 'http://localhost:3000'}/api/wearables/callback/${provider}`;
    const state = Buffer.from(JSON.stringify({ userId, provider })).toString('base64');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(provider: WearableProvider, code: string, state: string): Promise<{ userId: string }> {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    const config = OAUTH_CONFIGS[provider];

    const clientId = process.env[config.clientIdEnv]!;
    const clientSecret = process.env[config.clientSecretEnv]!;
    const redirectUri = `${process.env.API_URL || 'http://localhost:3000'}/api/wearables/callback/${provider}`;

    // Exchange code for tokens
    const tokenRes = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Error al obtener tokens de ${provider}`);
    }

    const tokens = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    await prisma.wearableConnection.upsert({
      where: { userId_provider: { userId, provider } },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt,
        isActive: true,
        lastSync: null,
      },
      create: {
        userId,
        provider,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt,
        isActive: true,
      },
    });

    return { userId };
  }

  // ── HealthKit (iOS Native Push) ────────────────────────────────────────

  async storeHealthKitData(userId: string, data: WearableData): Promise<void> {
    await this.storeNormalizedData(userId, 'healthkit', data);

    await prisma.wearableConnection.upsert({
      where: { userId_provider: { userId, provider: 'healthkit' } },
      update: { lastSync: new Date(), isActive: true },
      create: { userId, provider: 'healthkit', isActive: true, lastSync: new Date() },
    });
  }

  // ── Data Sync per provider ─────────────────────────────────────────────

  async syncUser(userId: string): Promise<{ synced: string[]; errors: string[] }> {
    const connections = await prisma.wearableConnection.findMany({
      where: { userId, isActive: true },
    });

    const synced: string[] = [];
    const errors: string[] = [];

    for (const conn of connections) {
      try {
        const provider = conn.provider as WearableProvider;

        // Refresh token if expiring soon
        if (conn.expiresAt && conn.refreshToken) {
          const expiresInMs = conn.expiresAt.getTime() - Date.now();
          if (expiresInMs < 5 * 60 * 1000) {
            await this.refreshToken(userId, provider, conn.refreshToken);
          }
        }

        const data = await this.fetchProviderData(provider, conn.accessToken!);
        if (data) {
          await this.storeNormalizedData(userId, provider, data);
          await prisma.wearableConnection.update({
            where: { id: conn.id },
            data: { lastSync: new Date() },
          });
          synced.push(provider);
        }
      } catch (err: any) {
        errors.push(`${conn.provider}: ${err.message}`);
      }
    }

    return { synced, errors };
  }

  private async refreshToken(userId: string, provider: WearableProvider, refreshToken: string): Promise<void> {
    const config = OAUTH_CONFIGS[provider];
    if (!config.tokenUrl) return;

    const clientId = process.env[config.clientIdEnv]!;
    const clientSecret = process.env[config.clientSecretEnv]!;

    const tokenRes = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!tokenRes.ok) return;

    const tokens = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    await prisma.wearableConnection.update({
      where: { userId_provider: { userId, provider } },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresAt,
      },
    });
  }

  private async fetchProviderData(provider: WearableProvider, accessToken: string): Promise<WearableData | null> {
    const today = new Date().toISOString().split('T')[0];

    switch (provider) {
      case 'fitbit':
        return this.fetchFitbitData(accessToken, today);
      case 'garmin':
        return this.fetchGarminData(accessToken, today);
      case 'google_fit':
        return this.fetchGoogleFitData(accessToken);
      case 'whoop':
        return this.fetchWhoopData(accessToken);
      case 'oura':
        return this.fetchOuraData(accessToken, today);
      case 'healthkit':
        return null; // push-based, not pull
      default:
        return null;
    }
  }

  private async fetchFitbitData(token: string, date: string): Promise<WearableData> {
    const headers = { Authorization: `Bearer ${token}` };

    const [activityRes, sleepRes, hrRes] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, { headers }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, { headers }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`, { headers }),
    ]);

    const activity = activityRes.ok ? await activityRes.json() as any : {};
    const sleep = sleepRes.ok ? await sleepRes.json() as any : {};
    const hr = hrRes.ok ? await hrRes.json() as any : {};

    return {
      steps: activity.summary?.steps,
      caloriesBurned: activity.summary?.caloriesOut,
      activeMinutes: (activity.summary?.fairlyActiveMinutes || 0) + (activity.summary?.veryActiveMinutes || 0),
      sleepMinutes: sleep.summary?.totalMinutesAsleep,
      heartRateResting: hr['activities-heart']?.[0]?.value?.restingHeartRate,
      date: new Date(date),
    };
  }

  private async fetchGarminData(token: string, date: string): Promise<WearableData> {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(`https://apis.garmin.com/wellness-api/rest/dailies?startDate=${date}&endDate=${date}`, { headers });

    if (!res.ok) return { date: new Date(date) };
    const data = await res.json() as any;
    const daily = data.dailies?.[0] || {};

    return {
      steps: daily.steps,
      caloriesBurned: daily.activeKilocalories,
      activeMinutes: Math.round((daily.moderateIntensityDurationInSeconds || 0) / 60),
      sleepMinutes: Math.round((daily.sleepingSeconds || 0) / 60),
      heartRateResting: daily.restingHeartRateInBeatsPerMinute,
      vo2Max: daily.vo2MaxPreciseValue,
      date: new Date(date),
    };
  }

  private async fetchGoogleFitData(token: string): Promise<WearableData> {
    const endTime = Date.now();
    const startTime = endTime - 86400000;

    const body = {
      aggregateBy: [
        { dataTypeName: 'com.google.step_count.delta' },
        { dataTypeName: 'com.google.calories.expended' },
        { dataTypeName: 'com.google.heart_rate.bpm' },
        { dataTypeName: 'com.google.active_minutes' },
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: startTime,
      endTimeMillis: endTime,
    };

    const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return { date: new Date() };
    const data = await res.json() as any;
    const bucket = data.bucket?.[0];

    const getValue = (typeName: string) => {
      const ds = bucket?.dataset?.find((d: any) => d.dataSourceId?.includes(typeName));
      return ds?.point?.[0]?.value?.[0]?.intVal || ds?.point?.[0]?.value?.[0]?.fpVal;
    };

    return {
      steps: getValue('step_count'),
      caloriesBurned: getValue('calories.expended'),
      heartRate: getValue('heart_rate.bpm'),
      activeMinutes: getValue('active_minutes'),
      date: new Date(),
    };
  }

  private async fetchWhoopData(token: string): Promise<WearableData> {
    const headers = { Authorization: `Bearer ${token}` };

    const [recoveryRes, sleepRes] = await Promise.all([
      fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', { headers }),
      fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers }),
    ]);

    const recovery = recoveryRes.ok ? await recoveryRes.json() as any : {};
    const sleep = sleepRes.ok ? await sleepRes.json() as any : {};

    const recoveryData = recovery.records?.[0];
    const sleepData = sleep.records?.[0];

    return {
      hrv: recoveryData?.score?.hrv_rmssd_milli,
      heartRateResting: recoveryData?.score?.resting_heart_rate,
      spo2: recoveryData?.score?.spo2_percentage,
      stressScore: recoveryData?.score?.recovery_score ? 100 - recoveryData.score.recovery_score : undefined,
      sleepMinutes: sleepData?.score?.total_in_bed_time_milli
        ? Math.round(sleepData.score.total_in_bed_time_milli / 60000)
        : undefined,
      date: new Date(),
    };
  }

  private async fetchOuraData(token: string, date: string): Promise<WearableData> {
    const headers = { Authorization: `Bearer ${token}` };

    const [readinessRes, sleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${date}&end_date=${date}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${date}&end_date=${date}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${date}&end_date=${date}`, { headers }),
    ]);

    const readiness = readinessRes.ok ? await readinessRes.json() as any : {};
    const sleep = sleepRes.ok ? await sleepRes.json() as any : {};
    const activity = activityRes.ok ? await activityRes.json() as any : {};

    const r = readiness.data?.[0];
    const s = sleep.data?.[0];
    const a = activity.data?.[0];

    return {
      heartRateResting: r?.contributors?.resting_heart_rate,
      hrv: r?.contributors?.hrv_balance,
      sleepMinutes: s?.total_sleep_duration ? Math.round(s.total_sleep_duration / 60) : undefined,
      sleepQuality: s?.score,
      steps: a?.steps,
      caloriesBurned: a?.total_calories,
      activeMinutes: a?.active_calories
        ? Math.round(a.active_calories / 5) // rough estimate
        : undefined,
      date: new Date(date),
    };
  }

  // ── Store normalized data ───────────────────────────────────────────────

  private async storeNormalizedData(userId: string, provider: string, data: WearableData): Promise<void> {
    // Store in NutritionProgress as wearable-sourced entry
    // (extends existing model to avoid extra migration for MVP)
    if (data.steps || data.caloriesBurned || data.heartRateResting) {
      await prisma.nutritionProgress.upsert({
        where: {
          userId_loggedDate: {
            userId,
            loggedDate: new Date(data.date.toISOString().split('T')[0]),
          },
        },
        update: {
          ...(data.caloriesBurned && { totalCalories: data.caloriesBurned }),
        },
        create: {
          userId,
          loggedDate: new Date(data.date.toISOString().split('T')[0]),
          totalCalories: data.caloriesBurned || 0,
          totalProteinG: 0,
          totalCarbsG: 0,
          totalFatG: 0,
        },
      });
    }
  }

  // ── Connection Management ─────────────────────────────────────────────

  async getConnections(userId: string) {
    return prisma.wearableConnection.findMany({
      where: { userId },
      select: {
        provider: true,
        isActive: true,
        lastSync: true,
        createdAt: true,
      },
    });
  }

  async disconnectProvider(userId: string, provider: WearableProvider): Promise<void> {
    await prisma.wearableConnection.updateMany({
      where: { userId, provider },
      data: { isActive: false, accessToken: null, refreshToken: null },
    });
  }
}

export const wearableService = new WearableService();
export default wearableService;
