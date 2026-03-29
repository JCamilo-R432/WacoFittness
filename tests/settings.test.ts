/**
 * Tests for User Settings validation and merge logic
 * Pure function tests — no DB required
 */

// ── Settings types and helpers ────────────────────────────────────────────

interface UserSettings {
  language: string;
  theme: 'dark' | 'light' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    workoutReminders: boolean;
    reminderTime?: string;
  };
  units: 'metric' | 'imperial';
  weekStartsOn: 0 | 1 | 6; // 0=Sunday, 1=Monday, 6=Saturday
  privacyLevel: 'public' | 'friends' | 'private';
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'es',
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    workoutReminders: true,
    reminderTime: '07:00',
  },
  units: 'metric',
  weekStartsOn: 1,
  privacyLevel: 'friends',
};

function mergeSettings(existing: Partial<UserSettings>, updates: Partial<UserSettings>): UserSettings {
  const merged = { ...DEFAULT_SETTINGS, ...existing };
  if (updates.notifications) {
    merged.notifications = { ...merged.notifications, ...updates.notifications };
  }
  return { ...merged, ...updates };
}

function validateSettings(settings: Partial<UserSettings>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validLanguages = ['es', 'en', 'pt', 'fr', 'de'];
  const validThemes = ['dark', 'light', 'system'];
  const validUnits = ['metric', 'imperial'];
  const validPrivacy = ['public', 'friends', 'private'];
  const validWeekStart = [0, 1, 6];

  if (settings.language && !validLanguages.includes(settings.language)) {
    errors.push(`Invalid language: ${settings.language}. Must be one of: ${validLanguages.join(', ')}`);
  }
  if (settings.theme && !validThemes.includes(settings.theme)) {
    errors.push(`Invalid theme: ${settings.theme}`);
  }
  if (settings.units && !validUnits.includes(settings.units)) {
    errors.push(`Invalid units: ${settings.units}`);
  }
  if (settings.privacyLevel && !validPrivacy.includes(settings.privacyLevel)) {
    errors.push(`Invalid privacy level: ${settings.privacyLevel}`);
  }
  if (settings.weekStartsOn !== undefined && !validWeekStart.includes(settings.weekStartsOn)) {
    errors.push(`Invalid weekStartsOn: ${settings.weekStartsOn}. Must be 0, 1, or 6`);
  }
  if (settings.notifications?.reminderTime) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(settings.notifications.reminderTime)) {
      errors.push('Invalid reminderTime format. Must be HH:MM (24h)');
    }
  }
  return { valid: errors.length === 0, errors };
}

function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return value;
  if (from === 'kg' && to === 'lbs') return Math.round(value * 2.20462 * 100) / 100;
  return Math.round((value / 2.20462) * 100) / 100;
}

function convertHeight(value: number, from: 'cm' | 'in', to: 'cm' | 'in'): number {
  if (from === to) return value;
  if (from === 'cm' && to === 'in') return Math.round((value / 2.54) * 10) / 10;
  return Math.round(value * 2.54 * 10) / 10;
}

describe('Settings — Validation', () => {
  it('passes valid settings', () => {
    const { valid, errors } = validateSettings({ language: 'es', theme: 'dark', units: 'metric' });
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('rejects invalid language', () => {
    const { valid, errors } = validateSettings({ language: 'xyz' });
    expect(valid).toBe(false);
    expect(errors[0]).toContain('language');
  });

  it('rejects invalid theme', () => {
    const { valid, errors } = validateSettings({ theme: 'neon' as any });
    expect(valid).toBe(false);
    expect(errors[0]).toContain('theme');
  });

  it('rejects invalid units', () => {
    const { valid, errors } = validateSettings({ units: 'stones' as any });
    expect(valid).toBe(false);
    expect(errors[0]).toContain('units');
  });

  it('rejects invalid privacy level', () => {
    const { valid, errors } = validateSettings({ privacyLevel: 'anonymous' as any });
    expect(valid).toBe(false);
    expect(errors[0]).toContain('privacy');
  });

  it('rejects invalid weekStartsOn', () => {
    const { valid, errors } = validateSettings({ weekStartsOn: 3 as any });
    expect(valid).toBe(false);
    expect(errors[0]).toContain('weekStartsOn');
  });

  it('rejects malformed reminder time', () => {
    const { valid, errors } = validateSettings({ notifications: { email: true, push: true, workoutReminders: true, reminderTime: '25:99' } });
    expect(valid).toBe(false);
    expect(errors[0]).toContain('reminderTime');
  });

  it('accepts valid 24h reminder time', () => {
    const { valid } = validateSettings({ notifications: { email: true, push: true, workoutReminders: true, reminderTime: '23:59' } });
    expect(valid).toBe(true);
  });

  it('accumulates multiple errors', () => {
    const { errors } = validateSettings({ language: 'xx', theme: 'rainbow' as any });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Settings — Merge', () => {
  it('applies updates over existing settings', () => {
    const result = mergeSettings({ language: 'es' }, { language: 'en' });
    expect(result.language).toBe('en');
  });

  it('preserves unmodified settings', () => {
    const result = mergeSettings({ theme: 'light' }, { language: 'pt' });
    expect(result.theme).toBe('light');
    expect(result.language).toBe('pt');
  });

  it('merges nested notification settings', () => {
    const result = mergeSettings(
      { notifications: { email: false, push: true, workoutReminders: true } },
      { notifications: { email: true, push: false, workoutReminders: true } }
    );
    expect(result.notifications.email).toBe(true);
    expect(result.notifications.push).toBe(false);
  });

  it('fills missing fields with defaults', () => {
    const result = mergeSettings({}, { language: 'en' });
    expect(result.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(result.units).toBe(DEFAULT_SETTINGS.units);
  });
});

describe('Settings — Unit Conversion', () => {
  it('converts kg to lbs', () => {
    expect(convertWeight(100, 'kg', 'lbs')).toBeCloseTo(220.46, 1);
  });

  it('converts lbs to kg', () => {
    expect(convertWeight(220.46, 'lbs', 'kg')).toBeCloseTo(100, 0);
  });

  it('returns same value when units are equal', () => {
    expect(convertWeight(75, 'kg', 'kg')).toBe(75);
    expect(convertWeight(165, 'lbs', 'lbs')).toBe(165);
  });

  it('converts cm to inches', () => {
    expect(convertHeight(180, 'cm', 'in')).toBeCloseTo(70.9, 0);
  });

  it('converts inches to cm', () => {
    expect(convertHeight(70, 'in', 'cm')).toBeCloseTo(177.8, 0);
  });

  it('returns same height when units are equal', () => {
    expect(convertHeight(180, 'cm', 'cm')).toBe(180);
  });
});
