// ── WacoCoach — Test Suite (FASE 3 + 4) ──────────────────────────────────
// Cubre: calculadoras, biblioteca de ejercicios, router híbrido, seguridad.
// NO requiere conexión a base de datos ni API de OpenAI.

import {
  calculateTMB,
  calculateTDEE,
  calculateMacros,
  estimate1RM,
  calculateIMC,
  calorieTarget,
} from '../src/utils/calculators';

import { searchExercise } from '../src/utils/exerciseLibrary';

import { routeQuery } from '../src/services/routerService';

import {
  sanitizeInput,
  isValidChatInput,
  validateUserAge,
  encryptHealthData,
  decryptHealthData,
} from '../src/services/securityService';

// Clave de prueba para encriptación (32 bytes en hex = 64 chars)
process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.MONGODB_ENCRYPTION_KEY = 'a'.repeat(64);

// ─────────────────────────────────────────────────────────────────────────────
//  CALCULADORAS
// ─────────────────────────────────────────────────────────────────────────────

describe('Calculators — TMB (Mifflin-St Jeor)', () => {
  test('Hombre 70kg 175cm 28 años → TMB ≈ 1659 kcal (Mifflin-St Jeor)', () => {
    const tmb = calculateTMB(70, 175, 28, 'male');
    expect(tmb).toBe(1659);
  });

  test('Mujer 60kg 165cm 30 años → TMB < hombre mismo perfil', () => {
    const female = calculateTMB(60, 165, 30, 'female');
    const male   = calculateTMB(60, 165, 30, 'male');
    expect(female).toBeLessThan(male);
  });

  test('TMB hombre es positivo para valores normales', () => {
    expect(calculateTMB(80, 180, 25, 'male')).toBeGreaterThan(1000);
  });
});

describe('Calculators — TDEE', () => {
  test('Actividad moderada multiplica TMB × 1.55', () => {
    const tmb = 1736;
    const tdee = calculateTDEE(tmb, 'moderately_active');
    expect(tdee).toBe(Math.round(tmb * 1.55));
  });

  test('Sedentario da TDEE más bajo que muy activo', () => {
    const tmb = 1700;
    expect(calculateTDEE(tmb, 'sedentary')).toBeLessThan(calculateTDEE(tmb, 'very_active'));
  });

  test('Nivel de actividad desconocido usa 1.375 (lightly_active)', () => {
    const tmb = 1700;
    const tdee = calculateTDEE(tmb, 'unknownLevel');
    expect(tdee).toBe(Math.round(tmb * 1.375));
  });
});

describe('Calculators — Macros', () => {
  test('Hipertrofia 70kg → proteína 112-154g', () => {
    const macros = calculateMacros(70, 2500, 'hipertrofia');
    expect(macros.protein.min).toBe(112); // 1.6 × 70
    expect(macros.protein.max).toBe(154); // 2.2 × 70
  });

  test('Pérdida de grasa → más proteína que mantenimiento', () => {
    const cut  = calculateMacros(70, 2000, 'perdida_grasa');
    const mant = calculateMacros(70, 2000, 'mantenimiento');
    expect(cut.protein.min).toBeGreaterThan(mant.protein.min);
  });

  test('Calorías del resultado == tdee pasado', () => {
    const macros = calculateMacros(75, 2800, 'mantenimiento');
    expect(macros.calories).toBe(2800);
  });
});

describe('Calculators — 1RM (Epley)', () => {
  test('100kg × 5 reps → 1RM entre 110 y 120 kg', () => {
    const rm = estimate1RM(100, 5) as number;
    expect(rm).toBeGreaterThan(110);
    expect(rm).toBeLessThan(120);
  });

  test('1 rep = peso levantado (sin extrapolación)', () => {
    expect(estimate1RM(120, 1)).toBe(120);
  });

  test('>10 reps retorna string de advertencia', () => {
    const result = estimate1RM(80, 15);
    expect(typeof result).toBe('string');
    expect(result as string).toMatch(/10 reps/i);
  });
});

describe('Calculators — IMC', () => {
  test('70kg 175cm → IMC ≈ 22.9 (Peso normal)', () => {
    const result = calculateIMC(70, 175);
    expect(result.imc).toBe(22.9);
    expect(result.classification).toBe('Peso normal');
  });

  test('90kg 175cm → Sobrepeso', () => {
    const result = calculateIMC(90, 175);
    expect(result.classification).toBe('Sobrepeso');
  });

  test('50kg 175cm → Bajo peso', () => {
    const result = calculateIMC(50, 175);
    expect(result.classification).toBe('Bajo peso');
  });

  test('Siempre incluye nota de limitaciones', () => {
    const result = calculateIMC(70, 175);
    expect(result.note).toBeTruthy();
    expect(result.note.length).toBeGreaterThan(10);
  });
});

describe('Calculators — calorieTarget', () => {
  test('Hipertrofia agrega +300 kcal', () => {
    const r = calorieTarget(2500, 'hipertrofia');
    expect(r.target).toBe(2800);
    expect(r.adjustment).toBe(300);
  });

  test('Pérdida de grasa resta -400 kcal', () => {
    const r = calorieTarget(2500, 'perdida_grasa');
    expect(r.target).toBe(2100);
    expect(r.adjustment).toBe(-400);
  });

  test('Mantenimiento no modifica calorías', () => {
    const r = calorieTarget(2500, 'mantenimiento');
    expect(r.target).toBe(2500);
    expect(r.adjustment).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  BIBLIOTECA DE EJERCICIOS
// ─────────────────────────────────────────────────────────────────────────────

describe('Exercise Library', () => {
  test('Busca sentadilla por nombre en español', () => {
    const ex = searchExercise('sentadilla');
    expect(ex).not.toBeNull();
    expect(ex!.id).toBe('sentadilla');
  });

  test('Busca bench press por nombre en inglés', () => {
    const ex = searchExercise('bench press');
    expect(ex).not.toBeNull();
    expect(ex!.id).toBe('press_banca');
  });

  test('Busca por músculo (cuádriceps → sentadilla)', () => {
    const ex = searchExercise('cuadriceps');
    expect(ex).not.toBeNull();
    expect(ex!.musculos.some(m => m.toLowerCase().includes('cu'))).toBe(true);
  });

  test('Retorna null si no encuentra el ejercicio', () => {
    const ex = searchExercise('ejercicio_inventado_xyz_123');
    expect(ex).toBeNull();
  });

  test('Ejercicio encontrado incluye técnica, errores_comunes, progresiones', () => {
    const ex = searchExercise('peso muerto');
    expect(ex).not.toBeNull();
    expect(Array.isArray(ex!.tecnica)).toBe(true);
    expect(ex!.tecnica.length).toBeGreaterThanOrEqual(5);
    expect(Array.isArray(ex!.errores_comunes)).toBe(true);
    expect(Array.isArray(ex!.progresiones)).toBe(true);
    expect(typeof ex!.respiracion).toBe('string');
    expect(typeof ex!.seguridad).toBe('string');
  });

  test('Busca por alias inglés (deadlift)', () => {
    const ex = searchExercise('deadlift');
    expect(ex!.id).toBe('peso_muerto');
  });

  test('Busca pull-up', () => {
    const ex = searchExercise('pull-up');
    expect(ex!.id).toBe('dominadas');
  });

  test('Busca push-up (flexiones)', () => {
    const ex = searchExercise('push-up');
    expect(ex!.id).toBe('flexiones');
  });

  test('Busca zancadas', () => {
    const ex = searchExercise('zancadas');
    expect(ex!.id).toBe('zancadas');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTER HÍBRIDO
// ─────────────────────────────────────────────────────────────────────────────

describe('Router Service — Detección de intenciones', () => {
  test('Emergencia médica (dolor en el pecho) → skipLLM = true', () => {
    const result = routeQuery('tengo dolor en el pecho', {});
    expect(result.type).toBe('emergency');
    expect(result.skipLLM).toBe(true);
    expect(result.directResponse).toMatch(/médico|emergenc/i);
  });

  test('Emergencia: desmayo → skipLLM = true', () => {
    const result = routeQuery('me desmayé en el gym', {});
    expect(result.type).toBe('emergency');
    expect(result.skipLLM).toBe(true);
  });

  test('Consulta de proteína → type = calculation, skipLLM = false', () => {
    const result = routeQuery('¿cuánta proteína necesito?', { weight: 70, goal: 'hipertrofia' });
    expect(result.type).toBe('calculation');
    expect(result.skipLLM).toBe(false);
  });

  test('Consulta de proteína con peso en texto → llmContextExtra contiene rango exacto', () => {
    const result = routeQuery('necesito saber cuánta proteína para 80kg', {});
    expect(result.llmContextExtra).toMatch(/proteín/i);
  });

  test('Consulta de sentadilla → type = exercise', () => {
    const result = routeQuery('¿cómo hacer sentadilla correctamente?', {});
    expect(result.type).toBe('exercise');
    expect(result.skipLLM).toBe(false);
    expect(result.exerciseInfo).toBeDefined();
  });

  test('Consulta 1RM → type = calculation con datos inyectados', () => {
    const result = routeQuery('cuál es mi 1rm si hago 100kg para 5 reps', {});
    expect(result.type).toBe('calculation');
    expect(result.llmContextExtra).toMatch(/1rm|1RM/i);
  });

  test('Consulta general → type = general, skipLLM = false', () => {
    const result = routeQuery('hola qué tal, estoy bien', {});
    expect(result.type).toBe('general');
    expect(result.skipLLM).toBe(false);
  });

  test('Consulta de peso muerto → type = exercise', () => {
    const result = routeQuery('técnica para peso muerto', {});
    expect(result.type).toBe('exercise');
    expect((result.exerciseInfo as any).id).toBe('peso_muerto');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SEGURIDAD
// ─────────────────────────────────────────────────────────────────────────────

describe('Security Service — Encriptación AES-256-GCM', () => {
  const testData = { weight: 75, injuries: 'rodilla izquierda', note: 'test' };

  test('Encripta y luego desencripta correctamente', () => {
    const encrypted = encryptHealthData(testData);
    const decrypted = decryptHealthData(encrypted);
    expect(decrypted.weight).toBe(75);
    expect(decrypted.injuries).toBe('rodilla izquierda');
  });

  test('Ciphertext es diferente al plaintext', () => {
    const encrypted = encryptHealthData(testData);
    expect(encrypted.ciphertext).not.toBe(JSON.stringify(testData));
  });

  test('Dos encriptaciones del mismo dato producen ciphertexts distintos (IV aleatorio)', () => {
    const enc1 = encryptHealthData(testData);
    const enc2 = encryptHealthData(testData);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
    expect(enc1.iv).not.toBe(enc2.iv);
  });

  test('Payload con tag modificado falla la desencriptación', () => {
    const encrypted = encryptHealthData(testData);
    encrypted.tag = 'a'.repeat(32);
    expect(() => decryptHealthData(encrypted)).toThrow();
  });
});

describe('Security Service — Validación de edad', () => {
  test('Fecha de nacimiento de >18 años → true', () => {
    expect(validateUserAge('1990-06-15')).toBe(true);
  });

  test('Fecha de nacimiento de 10 años → false', () => {
    const recent = new Date();
    recent.setFullYear(recent.getFullYear() - 10);
    const dateStr = recent.toISOString().split('T')[0];
    expect(validateUserAge(dateStr)).toBe(false);
  });

  test('Fecha inválida → false', () => {
    expect(validateUserAge('not-a-date')).toBe(false);
    expect(validateUserAge('')).toBe(false);
  });
});

describe('Security Service — Sanitización de input', () => {
  test('Elimina tags HTML', () => {
    const result = sanitizeInput('<script>alert("xss")</script>hola');
    expect(result).not.toContain('<script>');
    expect(result).toContain('hola');
  });

  test('Preserva caracteres latinos (ñ, tildes)', () => {
    const result = sanitizeInput('¿Cuánta proteína necesitás?');
    expect(result).toContain('proteína');
    expect(result).toContain('Cuánta');
  });

  test('Limita longitud a 2000 caracteres', () => {
    const long = 'a'.repeat(5000);
    expect(sanitizeInput(long).length).toBe(2000);
  });

  test('Elimina caracteres de control', () => {
    const withControl = 'hola\x00mundo\x1F';
    const result = sanitizeInput(withControl);
    expect(result).not.toMatch(/[\x00-\x08\x0E-\x1F]/);
  });
});

describe('Security Service — isValidChatInput', () => {
  test('Texto normal es válido', () => {
    expect(isValidChatInput('¿cuánta proteína necesito?')).toBe(true);
  });

  test('String vacío es inválido', () => {
    expect(isValidChatInput('')).toBe(false);
    expect(isValidChatInput('   ')).toBe(false);
  });

  test('Número y null son inválidos', () => {
    expect(isValidChatInput(123)).toBe(false);
    expect(isValidChatInput(null)).toBe(false);
    expect(isValidChatInput(undefined)).toBe(false);
  });

  test('Más de 1000 chars es inválido', () => {
    expect(isValidChatInput('a'.repeat(1001))).toBe(false);
  });
});
