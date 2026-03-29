// ========================
// DATA FORMATTERS
// ========================

/**
 * Format calories: 1850 → "1,850 kcal"
 */
export const formatCalories = (value: number): string =>
  `${value.toLocaleString('es-ES')} kcal`;

/**
 * Format macros: 125.5 → "125.5g"
 */
export const formatGrams = (value: number, decimals: number = 1): string =>
  `${value.toFixed(decimals)}g`;

/**
 * Format weight: 82.5 → "82.5 kg"
 */
export const formatWeight = (kg: number, unit: 'kg' | 'lb' = 'kg'): string => {
  if (unit === 'lb') return `${(kg * 2.205).toFixed(1)} lb`;
  return `${kg.toFixed(1)} kg`;
};

/**
 * Format height: 175 → "175 cm" or "5'9\""
 */
export const formatHeight = (cm: number, unit: 'cm' | 'ft' = 'cm'): string => {
  if (unit === 'ft') {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
};

/**
 * Format water: 1750 → "1.75 L"   or  250 → "250 ml"
 */
export const formatWater = (ml: number): string => {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  return `${ml} ml`;
};

/**
 * Format duration: 95 → "1h 35min"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

/**
 * Format date: ISO → "17 Mar 2026"
 */
export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Format time: ISO → "14:30"
 */
export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Format relative time: "Hace 5 min", "Hace 2h", "Ayer"
 */
export const formatRelativeTime = (iso: string): string => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHr < 24) return `Hace ${diffHr}h`;
  if (diffDay === 1) return 'Ayer';
  if (diffDay < 7) return `Hace ${diffDay} días`;
  return formatDate(iso);
};

/**
 * Format percentage: 0.856 → "85.6%"
 */
export const formatPercentage = (value: number, alreadyPercent = false): string => {
  const pct = alreadyPercent ? value : value * 100;
  return `${pct.toFixed(1)}%`;
};

/**
 * Format currency (MXN)
 */
export const formatCurrency = (amount: number): string =>
  `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Format number compactly: 12500 → "12.5k"
 */
export const formatCompact = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toString();
};

/**
 * Today as YYYY-MM-DD for API calls
 */
export const todayISO = (): string => new Date().toISOString().slice(0, 10);

/**
 * Format sleep hours: 7.5 → "7h 30min"
 */
export const formatSleepHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

/**
 * RPE descriptor
 */
export const formatRPE = (rpe: number): string => {
  const labels: Record<number, string> = {
    1: 'Muy fácil', 2: 'Fácil', 3: 'Ligero', 4: 'Moderado',
    5: 'Medio', 6: 'Algo duro', 7: 'Duro', 8: 'Muy duro',
    9: 'Extremo', 10: 'Máximo',
  };
  return labels[rpe] ?? `RPE ${rpe}`;
};
