import crypto from 'crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { supabaseAdmin } from '../config/supabase';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

// 🌱 Cliente global de MercadoPago (usado por toda la clase)
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

interface CreatePaymentParams {
  userId: string;
  planSlug: string;
  billingCycle: 'monthly' | 'yearly';
  userEmail: string;
  userName: string;
}

export class PaymentService {
  private isTest: boolean;

  constructor() {
    // Detecta automáticamente si el token es de pruebas
    this.isTest = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').startsWith('TEST');
  }

  /**
   * Genera una referencia única interna para trazabilidad.
   * Ya no se usa para el pago en sí, pero puede guardarse en la tabla si se desea.
   */
  private generateReference(userId: string): string {
    const timestamp = Date.now();
    const hash = crypto
      .createHash('md5')
      .update(`${userId}-${timestamp}`)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
    return `MP-${hash}-${timestamp}`;
  }

  /**
   * Obtiene el precio del plan desde Supabase.
   */
  async getPlanPrice(
    planSlug: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{ planId: string; amount: number; planName: string }> {
    const { data: plan, error } = await supabaseAdmin
      .from('plans')
      .select('id, name, price_monthly, price_yearly')
      .eq('slug', planSlug)
      .single();

    if (error || !plan) throw new Error(`Plan '${planSlug}' no encontrado`);

    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    if (amount === 0) throw new Error('El plan gratuito no requiere pago');

    return { planId: plan.id, amount, planName: plan.name };
  }

  /**
   * Crea un pago y devuelve la URL de redirección al checkout de MercadoPago.
   */
  async createPayment(params: CreatePaymentParams): Promise<{
    success: boolean;
    paymentId: string;
    redirectUrl?: string;
    error?: string;
  }> {
    const { userId, planSlug, billingCycle, userEmail, userName } = params;

    const { planId, amount, planName } = await this.getPlanPrice(planSlug, billingCycle);

    // 1. Registrar el pago en estado "pending"
    const { data: payment, error: dbError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount,
        currency: 'COP',
        billing_cycle: billingCycle,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError || !payment) {
      throw new Error('Error al registrar el pago: ' + (dbError?.message || 'desconocido'));
    }

    // 2. Crear la preferencia de pago en MercadoPago
    const unitPrice = Number((amount / 100).toFixed(2)); // Monto en COP (los precios están en centavos)

    const preferenceData = {
      items: [
        {
          id: planSlug,
          title: `AutomataVitae ${planName} - ${billingCycle === 'yearly' ? 'Anual' : 'Mensual'}`,
          unit_price: unitPrice,
          quantity: 1,
          currency_id: 'COP',
        },
      ],
      payer: {
        email: userEmail,
        name: userName,
      },
      external_reference: payment.id.toString(), // Relaciona el pago con nuestro registro
      back_urls: {
        success: `${process.env.FRONTEND_URL}/planes/confirmacion?status=success&payment_id=${payment.id}`,
        failure: `${process.env.FRONTEND_URL}/planes/confirmacion?status=failure&payment_id=${payment.id}`,
        pending: `${process.env.FRONTEND_URL}/planes/confirmacion?status=pending&payment_id=${payment.id}`,
      },
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
    };

    try {
      const preference = new Preference(mpClient);
      const response = await preference.create({ body: preferenceData });

      // Con el nuevo SDK, la respuesta contiene directamente los campos
      if (response.id) {
        // Guardar el ID de la preferencia para referencia
        await supabaseAdmin
          .from('payments')
          .update({ mp_preference_id: response.id })
          .eq('id', payment.id);

        const redirectUrl = this.isTest
          ? response.sandbox_init_point
          : response.init_point;

        return {
          success: true,
          paymentId: payment.id,
          redirectUrl,
        };
      } else {
        // Error al crear la preferencia
        await supabaseAdmin
          .from('payments')
          .update({ status: 'error' })
          .eq('id', payment.id);

        await notificationService.sendPaymentFailed({
          userId,
          userEmail,
          userName,
          planName,
          reference: payment.id.toString(),
          paymentId: payment.id,
        });

        return {
          success: false,
          paymentId: payment.id,
          error: 'Error al crear la preferencia de pago',
        };
      }
    } catch (err: any) {
      console.error('Error creando preferencia:', err);
      await supabaseAdmin
        .from('payments')
        .update({ status: 'error' })
        .eq('id', payment.id);
      throw err;
    }
  }

  /**
   * Activa la suscripción del usuario después de un pago aprobado.
   */
  async activateSubscription(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    externalReference: string
  ): Promise<Date> {
    const now = new Date();
    const periodEnd = new Date(now);

    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: userId,
        plan_id: planId,
        status: 'active',
        billing_cycle: billingCycle,
        started_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payu_plan_code: externalReference, // Puedes renombrar esta columna si lo deseas
      },
      { onConflict: 'user_id' }
    );

    return periodEnd;
  }

  /**
   * Procesa el webhook de MercadoPago (notificación de pago).
   */
  async processWebhook(webhookData: Record<string, any>): Promise<void> {
    const { type, data } = webhookData;

    // Solo nos interesan las notificaciones de tipo "payment"
    if (type !== 'payment') {
      console.log(`Ignorando webhook de tipo ${type}`);
      return;
    }

    const mpPaymentId = data?.id;
    if (!mpPaymentId) return;

    try {
      // Obtener la información actualizada del pago
      const paymentMP = new Payment(mpClient);
      const paymentInfo = await paymentMP.get({ id: mpPaymentId });

      const mpStatus = paymentInfo.status; // 'approved' | 'rejected' | 'pending' | 'in_process' | etc.
      const externalReference = paymentInfo.external_reference; // Nuestro payment.id interno

      if (!externalReference) {
        console.log('external_reference no encontrado en el pago de MP');
        return;
      }

      // Buscar el registro de pago en nuestra base de datos
      const { data: payment, error } = await supabaseAdmin
        .from('payments')
        .select('*, plans(id, name, price_monthly, price_yearly), profiles(email, full_name)')
        .eq('id', externalReference)
        .single();

      if (error || !payment) {
        console.log('Pago interno no encontrado para external_reference:', externalReference);
        return;
      }

      // Mapear el estado de MercadoPago a nuestro estado interno
      let newStatus: string;
      switch (mpStatus) {
        case 'approved':
          newStatus = 'approved';
          break;
        case 'rejected':
        case 'cancelled':
          newStatus = 'declined';
          break;
        default:
          newStatus = 'pending'; // 'pending', 'in_process', etc.
          break;
      }

      // Actualizar el registro con el ID del pago de MP y el nuevo estado
      await supabaseAdmin
        .from('payments')
        .update({
          status: newStatus,
          mp_payment_id: String(mpPaymentId),
        })
        .eq('id', payment.id);

      // Obtener datos para notificaciones
      const userEmail = payment.profiles?.email || '';
      const userName = payment.profiles?.full_name || userEmail;
      const planName = payment.plans?.name || 'Pro';

      if (newStatus === 'approved') {
        const periodEnd = await this.activateSubscription(
          payment.user_id,
          payment.plan_id,
          payment.billing_cycle,
          externalReference
        );

        await notificationService.sendPaymentConfirmed({
          userId: payment.user_id,
          userEmail,
          userName,
          planName,
          amount: payment.amount,
          billingCycle: payment.billing_cycle,
          reference: externalReference,
          periodEnd,
          paymentId: payment.id,
        });
      } else if (newStatus === 'declined') {
        await notificationService.sendPaymentFailed({
          userId: payment.user_id,
          userEmail,
          userName,
          planName,
          reference: externalReference,
          paymentId: payment.id,
        });
      }
    } catch (err) {
      console.error('Error procesando webhook de MercadoPago:', err);
    }
  }
}