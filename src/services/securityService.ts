// ── WacoCoach Security Service ────────────────────────────────────────────
// Encriptación AES-256-GCM para datos sensibles de salud,
// validación de edad mínima, sanitización de input.
// bcryptjs ya está en las dependencias del proyecto.

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ALGORITHM = 'aes-256-gcm';

// ── Encriptación de datos sensibles (AES-256-GCM) ─────────────────────────
// GCM incluye autenticación de integridad (mejor que CBC para datos en reposo)

export interface EncryptedPayload {
  ciphertext: string;  // hex
  iv: string;          // hex, 12 bytes para GCM
  tag: string;         // hex, authentication tag GCM
}

function getEncryptionKey(): Buffer {
  const raw = process.env.MONGODB_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  if (!raw || raw.length < 64) {
    throw new Error(
      'ENCRYPTION_KEY no configurada o muy corta. ' +
      'Generar con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return Buffer.from(raw.slice(0, 64), 'hex');
}

/**
 * Encripta datos sensibles de salud antes de guardarlos en la base de datos.
 * @param data - Objeto con datos sensibles (peso, lesiones, etc.)
 * @returns Payload encriptado { ciphertext, iv, tag }
 */
export function encryptHealthData(data: Record<string, unknown>): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12 bytes es el estándar para GCM

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM;
  const plaintext = JSON.stringify(data);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
}

/**
 * Desencripta datos de salud previamente encriptados.
 * @param payload - { ciphertext, iv, tag }
 * @returns Objeto original
 */
export function decryptHealthData(payload: EncryptedPayload): Record<string, unknown> {
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(payload.iv, 'hex'),
  ) as crypto.DecipherGCM;

  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

// ── Bcrypt helpers ────────────────────────────────────────────────────────

/**
 * Hashea una contraseña con bcrypt (10 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica una contraseña contra su hash bcrypt.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Validación de edad mínima ─────────────────────────────────────────────

/**
 * Verifica que el usuario sea mayor de edad (configurable via MIN_USER_AGE).
 * @param birthDate - Fecha de nacimiento ISO 8601 (YYYY-MM-DD)
 * @returns true si cumple la edad mínima
 */
export function validateUserAge(birthDate: string): boolean {
  if (!birthDate) return false;

  const today = new Date();
  const birth = new Date(birthDate);

  if (isNaN(birth.getTime())) return false;

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  const minAge = parseInt(process.env.MIN_USER_AGE || '18', 10);
  return age >= minAge;
}

// ── Sanitización de input ────────────────────────────────────────────────

/**
 * Sanitiza texto de usuario para prevenir XSS y strips caracteres de control.
 * No destruye el significado del mensaje (respeta ñ, tildes, etc.).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Caracteres de control ASCII (excepto \n, \t, \r)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limitar longitud máxima
    .slice(0, 2000)
    .trim();
}

/**
 * Verifica que un string sea un texto de chat válido (no vacío, longitud razonable).
 */
export function isValidChatInput(input: unknown): input is string {
  if (typeof input !== 'string') return false;
  const trimmed = input.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
}

// ── Generación de tokens seguros ─────────────────────────────────────────

/**
 * Genera un token aleatorio seguro (para API keys, refresh tokens, etc.)
 * @param bytes - Longitud en bytes (default 32 = 256 bits)
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
