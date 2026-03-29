// ── WacoCoach Router Service — Corazón del sistema híbrido ────────────────
// Analiza la intención del usuario ANTES de llamar al LLM.
// Objetivo: evitar llamadas al LLM cuando no son necesarias,
// e inyectar datos precisos calculados por el backend antes de llamar al LLM.

import { calculateTMB, calculateTDEE, calculateMacros, estimate1RM, calorieTarget, calculateIMC } from '../utils/calculators';
import { searchExercise } from '../utils/exerciseLibrary';

export type RouteType = 'emergency' | 'calculation' | 'exercise' | 'general';

export interface UserData {
  name?: string;
  weight?: number;       // kg
  height?: number;       // cm
  age?: number;
  gender?: 'male' | 'female';
  goal?: string;
  activityLevel?: string;
  level?: string;
}

export interface RouteResult {
  type: RouteType;
  skipLLM: boolean;
  directResponse?: string;       // Usar cuando skipLLM = true
  calculatedData?: object;       // Inyectar en el contexto del LLM
  exerciseInfo?: object;         // Inyectar en el contexto del LLM
  llmContextExtra?: string;      // Texto extra para agregar al prompt del LLM
}

// ── Detección de emergencias ──────────────────────────────────────────────

const EMERGENCY_KEYWORDS = [
  'dolor en el pecho', 'dolor pecho', 'chest pain',
  'dificultad para respirar', 'no puedo respirar',
  'desmayo', 'me desmayé', 'perdí el conocimiento',
  'emergencia', 'ambulancia', 'hospital urgente',
  'hormigueo en el brazo', 'brazo entumecido',
  'dolor de cabeza muy fuerte', 'peor dolor de cabeza',
  'visión borrosa repentina',
];

function isMedicalEmergency(input: string): boolean {
  const lower = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some(k => lower.includes(k));
}

// ── Detección de necesidad de cálculo ─────────────────────────────────────

const CALCULATION_KEYWORDS = [
  'proteína', 'proteínas', 'protein',
  'calorías', 'calorias', 'calories', 'kcal',
  'macros', 'macronutrientes',
  '1rm', 'una repetición máxima', 'repeticion maxima', 'máximo peso',
  'tmb', 'metabolismo basal',
  'tdee', 'gasto calórico',
  'déficit', 'deficit', 'superávit', 'superavit',
  'cuánto debo comer', 'cuanta proteina', 'cuantas calorias',
  'necesito para ganar músculo', 'necesito para perder',
  'imc', 'índice de masa corporal', 'indice de masa',
  'peso ideal', 'estoy en mi peso',
];

function requiresCalculation(input: string): boolean {
  const lower = input.toLowerCase();
  return CALCULATION_KEYWORDS.some(k => lower.includes(k));
}

// ── Detección de consulta de ejercicio ────────────────────────────────────

const EXERCISE_QUERY_KEYWORDS = [
  'sentadilla', 'squat', 'cuclillas',
  'peso muerto', 'deadlift',
  'press banca', 'press de banca', 'bench press',
  'press militar', 'press de hombros', 'overhead press',
  'dominadas', 'pull-up', 'pull up',
  'remo', 'row',
  'plancha', 'plank',
  'hip thrust',
  'técnica', 'tecnica', 'forma correcta', 'cómo hacer', 'como hacer',
  'errores al hacer', 'músculos trabaja', 'qué trabaja',
];

function isExerciseQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return EXERCISE_QUERY_KEYWORDS.some(k => lower.includes(k));
}

// ── Extracción de datos del input (NLP básico) ────────────────────────────

function extractWeight(input: string): number | null {
  const match = input.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kgs)/i);
  return match ? parseFloat(match[1]) : null;
}

function extractReps(input: string): number | null {
  const match = input.match(/(\d+)\s*(?:reps?|repeticiones?)/i);
  return match ? parseInt(match[1]) : null;
}

function extractWeightAndReps(input: string): { weight: number | null; reps: number | null } {
  return { weight: extractWeight(input), reps: extractReps(input) };
}

// ── Router principal ──────────────────────────────────────────────────────

export function routeQuery(userInput: string, userData: UserData = {}): RouteResult {

  // 1. ¿Es emergencia médica? → Respuesta directa, skip LLM para velocidad
  if (isMedicalEmergency(userInput)) {
    return {
      type: 'emergency',
      skipLLM: true,
      directResponse:
        '🚨 Esto suena serio. Por favor llamá a emergencias (112 / 911) o acudí a urgencias inmediatamente. ' +
        'No soy un médico y no puedo ayudarte con esto. Tu salud es lo primero.',
    };
  }

  // 2. ¿Requiere cálculo numérico? → Calcular en backend + inyectar en LLM
  if (requiresCalculation(userInput)) {
    const lower = userInput.toLowerCase();
    let calculatedData: Record<string, unknown> = {};
    let contextLines: string[] = [];

    // 1RM
    if (lower.includes('1rm') || lower.includes('repeticion maxima') || lower.includes('máximo peso')) {
      const { weight, reps } = extractWeightAndReps(userInput);
      if (weight && reps) {
        const orm = estimate1RM(weight, reps);
        calculatedData = { type: '1rm', weight, reps, estimated1RM: orm };
        contextLines.push(`1RM estimado: ${orm} kg (${weight}kg × ${reps} reps, fórmula Epley)`);
      }
    }

    // TMB + TDEE + Macros (si hay datos del usuario)
    const inputWeight = extractWeight(userInput) || userData.weight;
    if (inputWeight && userData.height && userData.age && userData.gender) {
      const tmb = calculateTMB(inputWeight, userData.height, userData.age, userData.gender);
      const tdee = calculateTDEE(tmb, userData.activityLevel || 'moderately_active');
      const macros = calculateMacros(inputWeight, tdee, userData.goal || 'mantenimiento');
      const target = calorieTarget(tdee, userData.goal || 'mantenimiento');

      calculatedData = {
        ...calculatedData,
        tmb,
        tdee,
        macros,
        calorieTarget: target,
        weight: inputWeight,
        goal: userData.goal,
      };

      contextLines.push(
        `TMB: ${tmb} kcal/día`,
        `TDEE (${userData.activityLevel || 'moderately_active'}): ${tdee} kcal/día`,
        `Objetivo calórico (${userData.goal}): ${target.target} kcal/día (${target.label})`,
        `Proteínas: ${macros.protein.min}-${macros.protein.max}g/día`,
        `Grasas: ${macros.fat.min}-${macros.fat.max}g/día`,
        `Carbohidratos: ~${macros.carbs.approx}g/día`,
      );
    } else if (inputWeight) {
      // Solo proteínas por peso (caso más común)
      const isGain = (userData.goal || '').toLowerCase().includes('hiper') ||
                     (userData.goal || '').toLowerCase().includes('muscle');
      const protMin = isGain ? Math.round(1.6 * inputWeight) : Math.round(1.2 * inputWeight);
      const protMax = isGain ? Math.round(2.2 * inputWeight) : Math.round(1.6 * inputWeight);

      calculatedData = { ...calculatedData, protein_min: protMin, protein_max: protMax, weight: inputWeight };
      contextLines.push(`Proteínas para ${inputWeight}kg: ${protMin}-${protMax}g/día`);
    }

    // IMC
    if (lower.includes('imc') || lower.includes('indice de masa') || lower.includes('peso ideal')) {
      const w = extractWeight(userInput) || userData.weight;
      if (w && userData.height) {
        const imcResult = calculateIMC(w, userData.height);
        calculatedData = { ...calculatedData, ...imcResult, weight: w, height: userData.height };
        contextLines.push(
          `IMC: ${imcResult.imc} (${imcResult.classification})`,
          imcResult.note,
        );
      }
    }

    if (contextLines.length > 0) {
      return {
        type: 'calculation',
        skipLLM: false,
        calculatedData,
        llmContextExtra: `\n\n[DATOS CALCULADOS POR EL BACKEND — USAR EXACTAMENTE ESTOS VALORES]:\n${contextLines.join('\n')}`,
      };
    }
  }

  // 3. ¿Es consulta de ejercicio? → Buscar en biblioteca + inyectar en LLM
  if (isExerciseQuery(userInput)) {
    const exercise = searchExercise(userInput);
    if (exercise) {
      const infoLines = [
        `Ejercicio: ${exercise.nombre} (${exercise.nombreEn})`,
        `Músculos principales: ${exercise.musculos.join(', ')}`,
        `Músculos secundarios: ${exercise.musculosSecundarios.join(', ')}`,
        `Nivel: ${exercise.nivel} | Tipo: ${exercise.tipo}`,
        `Técnica correcta:\n${exercise.tecnica.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`,
        `Errores comunes:\n${exercise.errores_comunes.map(e => `  • ${e.error} → ${e.solucion}`).join('\n')}`,
        exercise.variaciones?.length ? `Variaciones: ${exercise.variaciones.join(', ')}` : '',
      ].filter(Boolean);

      return {
        type: 'exercise',
        skipLLM: false,
        exerciseInfo: exercise,
        llmContextExtra: `\n\n[INFORMACIÓN DEL EJERCICIO (DATOS EXACTOS DE LA BIBLIOTECA)]:\n${infoLines.join('\n')}`,
      };
    }
  }

  // 4. Consulta general → LLM con contexto de usuario
  return {
    type: 'general',
    skipLLM: false,
  };
}
