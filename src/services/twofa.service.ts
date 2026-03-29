import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import prisma from '../config/database';

const APP_NAME = 'WacoPro Fitness';
const BACKUP_CODES_COUNT = 8;

export class TwoFAService {
  /**
   * Genera un nuevo secret TOTP y devuelve el QR code para escanearlo.
   * NO lo guarda en BD hasta que el usuario lo verifique.
   */
  async generateSetupData(userId: string, email: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
  }> {
    const secret = authenticator.generateSecret(20);
    const otpauthUrl = authenticator.keyuri(email, APP_NAME, secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Guardar el secret temporalmente (no activado aún)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFASecret: secret, twoFAEnabled: false },
    });

    return { secret, qrCodeUrl, otpauthUrl };
  }

  /**
   * Verifica el código TOTP y activa 2FA si es correcto.
   * Devuelve los backup codes generados.
   */
  async verifyAndEnable(userId: string, code: string): Promise<{ backupCodes: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFASecret: true, twoFAEnabled: true },
    });

    if (!user?.twoFASecret) throw new Error('Setup de 2FA no iniciado');
    if (user.twoFAEnabled) throw new Error('2FA ya está habilitado');

    const isValid = authenticator.verify({ token: code, secret: user.twoFASecret });
    if (!isValid) throw new Error('Código TOTP inválido');

    const backupCodes = this.generateBackupCodes();
    const hashedCodes = backupCodes.map(c => this.hashBackupCode(c));

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFAEnabled: true,
        twoFABackupCodes: hashedCodes,
      },
    });

    return { backupCodes };
  }

  /**
   * Verifica un código TOTP en el flujo de login.
   */
  async verifyLogin(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFASecret: true, twoFAEnabled: true, twoFABackupCodes: true },
    });

    if (!user?.twoFAEnabled || !user.twoFASecret) return true; // 2FA no activo = ok

    // Verificar código TOTP normal
    const isTotp = authenticator.verify({ token: code, secret: user.twoFASecret });
    if (isTotp) return true;

    // Verificar backup code
    const hashedCode = this.hashBackupCode(code);
    const backupIndex = user.twoFABackupCodes.indexOf(hashedCode);
    if (backupIndex !== -1) {
      // Eliminar el backup code usado (one-time use)
      const remaining = [...user.twoFABackupCodes];
      remaining.splice(backupIndex, 1);
      await prisma.user.update({
        where: { id: userId },
        data: { twoFABackupCodes: remaining },
      });
      return true;
    }

    return false;
  }

  /**
   * Desactiva 2FA. Requiere verificación del código actual.
   */
  async disable(userId: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFASecret: true, twoFAEnabled: true },
    });

    if (!user?.twoFAEnabled) throw new Error('2FA no está habilitado');
    if (!user.twoFASecret) throw new Error('Secret no encontrado');

    const isValid = authenticator.verify({ token: code, secret: user.twoFASecret });
    if (!isValid) throw new Error('Código TOTP inválido. No se puede desactivar 2FA.');

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFAEnabled: false,
        twoFASecret: null,
        twoFABackupCodes: [],
      },
    });
  }

  /**
   * Regenera backup codes (requiere código TOTP válido).
   */
  async regenerateBackupCodes(userId: string, code: string): Promise<{ backupCodes: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFASecret: true, twoFAEnabled: true },
    });

    if (!user?.twoFAEnabled || !user.twoFASecret) throw new Error('2FA no habilitado');

    const isValid = authenticator.verify({ token: code, secret: user.twoFASecret });
    if (!isValid) throw new Error('Código TOTP inválido');

    const backupCodes = this.generateBackupCodes();
    await prisma.user.update({
      where: { id: userId },
      data: { twoFABackupCodes: backupCodes.map(c => this.hashBackupCode(c)) },
    });

    return { backupCodes };
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: BACKUP_CODES_COUNT }, () =>
      crypto.randomBytes(5).toString('hex').toUpperCase(), // ej: "A1B2C3D4E5"
    );
  }

  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
  }
}

export default new TwoFAService();
