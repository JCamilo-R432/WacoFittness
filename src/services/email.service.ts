import sgMail from '@sendgrid/mail';

// Inicializar SendGrid solo si la API key está configurada
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@wacopro.com';
const FROM_NAME = process.env.FROM_NAME || 'WacoPro Fitness';

if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private async send(options: EmailOptions): Promise<void> {
    if (!SENDGRID_KEY) {
      console.log(`[EmailService] (dev) Email a ${options.to}: ${options.subject}`);
      return;
    }

    await sgMail.send({
      to: options.to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ''),
    });
  }

  // ── Templates ─────────────────────────────────────────────────────────────

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: '¡Bienvenido a WacoPro Fitness! 💪',
      html: this.buildTemplate(
        '¡Bienvenido a WacoPro!',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente. ¡Estás listo para comenzar tu journey fitness!</p>
        <p>Con WacoPro puedes:</p>
        <ul>
          <li>📊 Trackear tu nutrición y entrenamiento</li>
          <li>💧 Monitorear tu hidratación</li>
          <li>😴 Optimizar tu recuperación</li>
          <li>👥 Conectar con la comunidad fitness</li>
        </ul>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" class="btn">
          Ir al Dashboard
        </a>
        `,
      ),
    });
  }

  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await this.send({
      to,
      subject: 'Restablecer contraseña - WacoPro Fitness',
      html: this.buildTemplate(
        'Restablecer Contraseña',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Este enlace expira en <strong>1 hora</strong>.</p>
        <a href="${resetUrl}" class="btn">Restablecer Contraseña</a>
        <p style="color:#6B7280;font-size:14px;margin-top:20px;">
          Si no solicitaste este cambio, ignora este email.
        </p>
        `,
      ),
    });
  }

  async sendPaymentSuccess(
    to: string,
    name: string,
    planName: string,
    amount: number,
    receiptUrl?: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: `Pago confirmado - WacoPro ${planName} ✅`,
      html: this.buildTemplate(
        'Pago Confirmado',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu pago ha sido procesado exitosamente.</p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:#166534;"><strong>Plan:</strong> WacoPro ${planName}</p>
          <p style="margin:4px 0 0;color:#166534;"><strong>Monto:</strong> $${(amount / 100).toFixed(2)} USD</p>
        </div>
        ${receiptUrl ? `<a href="${receiptUrl}" class="btn">Ver Recibo</a>` : ''}
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/billing" style="display:inline-block;margin-left:12px;color:#3B82F6;">
          Gestionar Suscripción
        </a>
        `,
      ),
    });
  }

  async sendPaymentFailed(to: string, name: string, planName: string): Promise<void> {
    await this.send({
      to,
      subject: 'Problema con tu pago - WacoPro Fitness',
      html: this.buildTemplate(
        'Problema con el Pago',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>No pudimos procesar el pago de tu suscripción <strong>${planName}</strong>.</p>
        <p>Para mantener tu acceso, por favor actualiza tu método de pago:</p>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/billing" class="btn">
          Actualizar Método de Pago
        </a>
        `,
      ),
    });
  }

  async sendSubscriptionCanceled(
    to: string,
    name: string,
    endDate: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: 'Suscripción cancelada - WacoPro Fitness',
      html: this.buildTemplate(
        'Suscripción Cancelada',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu suscripción ha sido cancelada. Mantendrás acceso hasta el <strong>${endDate}</strong>.</p>
        <p>Esperamos verte de nuevo. Puedes reactivar en cualquier momento:</p>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/pricing" class="btn">
          Reactivar Suscripción
        </a>
        `,
      ),
    });
  }

  async sendTwoFAEnabled(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: 'Autenticación 2FA activada - WacoPro Fitness 🔐',
      html: this.buildTemplate(
        '2FA Activado',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>La autenticación de dos factores ha sido activada en tu cuenta.</p>
        <p>Si no fuiste tú, <a href="${process.env.APP_URL || 'http://localhost:3000'}/security">
          revisa tu cuenta de inmediato
        </a>.</p>
        `,
      ),
    });
  }

  async send2FABackupCodes(to: string, name: string, codes: string[]): Promise<void> {
    await this.send({
      to,
      subject: 'Tus códigos de respaldo 2FA - WacoPro Fitness',
      html: this.buildTemplate(
        'Códigos de Respaldo 2FA',
        `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Guarda estos códigos de respaldo en un lugar seguro. Cada código solo puede usarse una vez:</p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;font-family:monospace;font-size:16px;letter-spacing:2px;">
          ${codes.map(c => `<p style="margin:4px 0;">${c}</p>`).join('')}
        </div>
        <p style="color:#EF4444;"><strong>⚠️ No compartas estos códigos con nadie.</strong></p>
        `,
      ),
    });
  }

  // ── Base template ─────────────────────────────────────────────────────────

  private buildTemplate(title: string, content: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F3F4F6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; color: #374151; line-height: 1.6; }
    .body h2 { color: #111827; margin-top: 0; }
    .btn { display: inline-block; background: #3B82F6; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
    .footer { background: #F9FAFB; padding: 20px; text-align: center; color: #9CA3AF; font-size: 13px; border-top: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>💪 WacoPro Fitness</h1></div>
    <div class="body">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      WacoPro Fitness &bull; Este email fue enviado automáticamente, no responder.<br>
      <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="color:#3B82F6;">Ir a WacoPro</a>
    </div>
  </div>
</body>
</html>`;
  }
}

export const emailService = new EmailService();
export default emailService;
