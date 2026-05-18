import { Resend } from 'resend';
import { supabaseAdmin } from '../config/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'AutomataVitae <notificaciones@automatavitae.com>';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutomataVitae</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #f4f4f5; }
    .container { max-width: 600px; margin: 40px auto; background: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden; }
    .header { padding: 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); text-align: center; }
    .header h1 { font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px; }
    .header span { opacity: 0.8; font-weight: 300; }
    .body { padding: 40px 32px; }
    .body h2 { font-size: 20px; font-weight: 600; color: #f4f4f5; margin-bottom: 12px; }
    .body p { color: #a1a1aa; line-height: 1.6; margin-bottom: 16px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
    .badge-green { background: #14532d; color: #4ade80; }
    .badge-red { background: #450a0a; color: #f87171; }
    .badge-blue { background: #1e3a5f; color: #60a5fa; }
    .info-box { background: #27272a; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3f3f46; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #71717a; font-size: 14px; }
    .info-value { color: #f4f4f5; font-size: 14px; font-weight: 500; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px; margin-top: 8px; }
    .footer { padding: 24px 32px; border-top: 1px solid #27272a; text-align: center; }
    .footer p { color: #52525b; font-size: 12px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>A Automata <span>Vitae</span></h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 AutomataVitae · Diseña tu futuro profesional con IA<br>
      Si no reconoces esta actividad, ignora este correo.</p>
    </div>
  </div>
</body>
</html>
`;

const paymentConfirmedTemplate = (data: {
  userName: string;
  planName: string;
  amount: string;
  billingCycle: string;
  reference: string;
  periodEnd: string;
}) => baseTemplate(`
  <span class="badge badge-green">✓ Pago Confirmado</span>
  <h2>¡Tu suscripción está activa!</h2>
  <p>Hola ${data.userName}, tu pago fue procesado exitosamente. Ya puedes disfrutar de todos los beneficios del plan <strong style="color: #a78bfa">${data.planName}</strong>.</p>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Plan</span>
      <span class="info-value">${data.planName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Monto</span>
      <span class="info-value">${data.amount}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Ciclo</span>
      <span class="info-value">${data.billingCycle === 'yearly' ? 'Anual' : 'Mensual'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Próxima renovación</span>
      <span class="info-value">${data.periodEnd}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Referencia</span>
      <span class="info-value" style="font-family: monospace; font-size: 12px">${data.reference}</span>
    </div>
  </div>

  <a href="${process.env.FRONTEND_URL}/create" class="btn">Crear mi CV ahora →</a>
`);

const paymentFailedTemplate = (data: {
  userName: string;
  planName: string;
  reference: string;
}) => baseTemplate(`
  <span class="badge badge-red">✗ Pago Fallido</span>
  <h2>Hubo un problema con tu pago</h2>
  <p>Hola ${data.userName}, lamentablemente no pudimos procesar tu pago para el plan <strong style="color: #a78bfa">${data.planName}</strong>.</p>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Plan intentado</span>
      <span class="info-value">${data.planName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Referencia</span>
      <span class="info-value" style="font-family: monospace; font-size: 12px">${data.reference}</span>
    </div>
  </div>

  <p>Puedes intentarlo de nuevo cuando quieras. Si el problema persiste, contáctanos.</p>
  <a href="${process.env.FRONTEND_URL}/planes" class="btn">Intentar de nuevo →</a>
`);

const paymentRenewalTemplate = (data: {
  userName: string;
  planName: string;
  amount: string;
  renewalDate: string;
}) => baseTemplate(`
  <span class="badge badge-blue">⟳ Renovación Próxima</span>
  <h2>Tu suscripción se renueva pronto</h2>
  <p>Hola ${data.userName}, te recordamos que tu plan <strong style="color: #a78bfa">${data.planName}</strong> se renovará automáticamente en 3 días.</p>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">Plan</span>
      <span class="info-value">${data.planName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Monto a cobrar</span>
      <span class="info-value">${data.amount}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Fecha de renovación</span>
      <span class="info-value">${data.renewalDate}</span>
    </div>
  </div>

  <p>Si deseas cancelar antes de la renovación, puedes hacerlo desde tu perfil.</p>
  <a href="${process.env.FRONTEND_URL}/planes" class="btn">Gestionar suscripción →</a>
`);

export class NotificationService {

  private async saveNotification(data: {
    userId: string;
    eventType: string;
    toEmail: string;
    subject: string;
    paymentId?: string;
    resendId?: string;
    status: 'sent' | 'failed';
    errorMessage?: string;
  }) {
    await supabaseAdmin.from('notifications').insert({
      user_id: data.userId,
      event_type: data.eventType,
      to_email: data.toEmail,
      subject: data.subject,
      payment_id: data.paymentId || null,
      resend_id: data.resendId || null,
      status: data.status,
      error_message: data.errorMessage || null,
      sent_at: data.status === 'sent' ? new Date().toISOString() : null,
    });
  }

  async sendPaymentConfirmed(params: {
    userId: string;
    userEmail: string;
    userName: string;
    planName: string;
    amount: number;
    billingCycle: string;
    reference: string;
    periodEnd: Date;
    paymentId: string;
  }) {
    const subject = `✓ Pago confirmado - Plan ${params.planName}`;
    const amountFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(params.amount / 100);

    const periodEndFormatted = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(params.periodEnd);

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: params.userEmail,
        subject,
        html: paymentConfirmedTemplate({
          userName: params.userName,
          planName: params.planName,
          amount: amountFormatted,
          billingCycle: params.billingCycle,
          reference: params.reference,
          periodEnd: periodEndFormatted,
        }),
      });

      if (error) throw new Error(error.message);

      await this.saveNotification({
        userId: params.userId,
        eventType: 'payment_confirmed',
        toEmail: params.userEmail,
        subject,
        paymentId: params.paymentId,
        resendId: data?.id,
        status: 'sent',
      });

      console.log(` Email de confirmación enviado a ${params.userEmail}`);
    } catch (err: any) {
      console.error(' Error enviando email de confirmación:', err.message);
      await this.saveNotification({
        userId: params.userId,
        eventType: 'payment_confirmed',
        toEmail: params.userEmail,
        subject,
        paymentId: params.paymentId,
        status: 'failed',
        errorMessage: err.message,
      });
    }
  }

  async sendPaymentFailed(params: {
    userId: string;
    userEmail: string;
    userName: string;
    planName: string;
    reference: string;
    paymentId: string;
  }) {
    const subject = `✗ Pago fallido - Plan ${params.planName}`;

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: params.userEmail,
        subject,
        html: paymentFailedTemplate({
          userName: params.userName,
          planName: params.planName,
          reference: params.reference,
        }),
      });

      if (error) throw new Error(error.message);

      await this.saveNotification({
        userId: params.userId,
        eventType: 'payment_failed',
        toEmail: params.userEmail,
        subject,
        paymentId: params.paymentId,
        resendId: data?.id,
        status: 'sent',
      });

      console.log(` Email de fallo enviado a ${params.userEmail}`);
    } catch (err: any) {
      console.error(' Error enviando email de fallo:', err.message);
      await this.saveNotification({
        userId: params.userId,
        eventType: 'payment_failed',
        toEmail: params.userEmail,
        subject,
        paymentId: params.paymentId,
        status: 'failed',
        errorMessage: err.message,
      });
    }
  }

  async sendPaymentRenewal(params: {
    userId: string;
    userEmail: string;
    userName: string;
    planName: string;
    amount: number;
    renewalDate: Date;
  }) {
    const subject = `⟳ Tu plan ${params.planName} se renueva en 3 días`;
    const amountFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(params.amount / 100);

    const renewalDateFormatted = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(params.renewalDate);

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: params.userEmail,
        subject,
        html: paymentRenewalTemplate({
          userName: params.userName,
          planName: params.planName,
          amount: amountFormatted,
          renewalDate: renewalDateFormatted,
        }),
      });

      if (error) throw new Error(error.message);

      await this.saveNotification({
        userId: params.userId,
        eventType: 'payment_renewal',
        toEmail: params.userEmail,
        subject,
        resendId: data?.id,
        status: 'sent',
      });

      console.log(` Email de renovación enviado a ${params.userEmail}`);
    } catch (err: any) {
      console.error(' Error enviando email de renovación:', err.message);
      await this.saveNotification({
        userId: params.userId,
        eventType: 'payment_renewal',
        toEmail: params.userEmail,
        subject,
        status: 'failed',
        errorMessage: err.message,
      });
    }
  }
}