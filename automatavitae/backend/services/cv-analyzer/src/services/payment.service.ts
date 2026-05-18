import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

interface CreatePaymentParams {
  userId: string;
  planSlug: string;
  billingCycle: 'monthly' | 'yearly';
  userEmail: string;
  userName: string;
}

interface PayUResponse {
  transactionResponse: {
    orderId: string;
    transactionId: string;
    state: string;
    responseCode: string;
    responseMessage: string;
    networkResponseCode: string;
    pendingReason?: string;
  };
  code: string;
  error?: string;
}

export class PaymentService {
  private apiUrl: string;
  private apiKey: string;
  private apiLogin: string;
  private merchantId: string;
  private accountId: string;
  private isTest: boolean;

  constructor() {
    this.isTest = process.env.PAYU_ENV !== 'production';
    this.apiUrl = this.isTest
      ? 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi'
      : 'https://api.payulatam.com/payments-api/4.0/service.cgi';
    this.apiKey     = process.env.PAYU_API_KEY || '';
    this.apiLogin   = process.env.PAYU_API_LOGIN || '';
    this.merchantId = process.env.PAYU_MERCHANT_ID || '';
    this.accountId  = process.env.PAYU_ACCOUNT_ID || '';
  }

  private generateSignature(referenceCode: string, amount: string, currency: string): string {
    const raw = `${this.apiKey}~${this.merchantId}~${referenceCode}~${amount}~${currency}`;
    return crypto.createHash('md5').update(raw).digest('hex');
  }

  private generateReference(userId: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5')
      .update(`${userId}-${timestamp}`)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
    return `AV-${hash}-${timestamp}`;
  }

  async getPlanPrice(planSlug: string, billingCycle: 'monthly' | 'yearly'): Promise<{
    planId: string;
    amount: number;
    planName: string;
  }> {
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

  async createPayment(params: CreatePaymentParams): Promise<{
    success: boolean;
    paymentId: string;
    redirectUrl?: string;
    error?: string;
  }> {
    const { userId, planSlug, billingCycle, userEmail, userName } = params;

    const { planId, amount, planName } = await this.getPlanPrice(planSlug, billingCycle);

    const reference = this.generateReference(userId);
    const amountStr = (amount / 100).toFixed(2);
    const signature = this.generateSignature(reference, amountStr, 'COP');

    const { data: payment, error: dbError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        plan_id: planId,
        amount,
        currency: 'COP',
        billing_cycle: billingCycle,
        status: 'pending',
        payu_reference: reference,
      })
      .select()
      .single();

    if (dbError) throw new Error('Error al registrar el pago: ' + dbError.message);

    const payuPayload = {
      language: 'es',
      command: 'SUBMIT_TRANSACTION',
      merchant: { apiKey: this.apiKey, apiLogin: this.apiLogin },
      transaction: {
        order: {
          accountId: this.accountId,
          referenceCode: reference,
          description: `AutomataVitae ${planName} - ${billingCycle === 'yearly' ? 'Anual' : 'Mensual'}`,
          language: 'es',
          signature,
          notifyUrl: `${process.env.BACKEND_URL}/api/payments/webhook`,
          additionalValues: {
            TX_VALUE: { value: amountStr, currency: 'COP' },
          },
          buyer: { emailAddress: userEmail, fullName: userName },
        },
        payer: { emailAddress: userEmail, fullName: userName },
        type: 'AUTHORIZATION_AND_CAPTURE',
        paymentMethod: 'PSE',
        paymentCountry: 'CO',
        deviceSessionId: `session-${userId}-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        extraParameters: {
          RESPONSE_URL: `${process.env.FRONTEND_URL}/planes/confirmacion?ref=${reference}`,
          PSE_REFERENCE1: userId,
          PSE_REFERENCE2: planSlug,
          PSE_REFERENCE3: billingCycle,
        },
      },
      test: this.isTest,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payuPayload),
      });

      const payuData = await response.json() as PayUResponse;

      if (payuData.code === 'SUCCESS' && payuData.transactionResponse) {
        const tx = payuData.transactionResponse;
        const isApproved = tx.state === 'APPROVED';

        await supabaseAdmin
          .from('payments')
          .update({
            payu_order_id: String(tx.orderId),
            payu_transaction_id: tx.transactionId,
            payu_response_code: tx.responseCode,
            payu_response_message: tx.responseMessage,
            status: isApproved ? 'approved' : 'pending',
          })
          .eq('id', payment.id);

        if (isApproved) {
          const periodEnd = await this.activateSubscription(userId, planId, billingCycle, reference);

          // Enviar email de confirmación
          await notificationService.sendPaymentConfirmed({
            userId,
            userEmail,
            userName,
            planName,
            amount,
            billingCycle,
            reference,
            periodEnd,
            paymentId: payment.id,
          });
        }

        const redirectUrl = `${process.env.FRONTEND_URL}/planes/confirmacion?ref=${reference}`;
        return { success: true, paymentId: payment.id, redirectUrl };

      } else {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'error', payu_response_message: payuData.error })
          .eq('id', payment.id);

        // Enviar email de fallo
        await notificationService.sendPaymentFailed({
          userId,
          userEmail,
          userName,
          planName,
          reference,
          paymentId: payment.id,
        });

        return { success: false, paymentId: payment.id, error: payuData.error || 'Error en PayU' };
      }
    } catch (err) {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'error' })
        .eq('id', payment.id);
      throw err;
    }
  }

  async activateSubscription(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    payuReference: string
  ): Promise<Date> {
    const now = new Date();
    const periodEnd = new Date(now);

    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        billing_cycle: billingCycle,
        started_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payu_plan_code: payuReference,
      }, { onConflict: 'user_id' });

    return periodEnd;
  }

  async processWebhook(webhookData: Record<string, string>): Promise<void> {
    const { reference_sale, state_pol, response_code_pol, value, sign } = webhookData;

    const expectedSign = crypto
      .createHash('md5')
      .update(`${this.apiKey}~${this.merchantId}~${reference_sale}~${value}~COP~${state_pol}`)
      .digest('hex');

    if (sign !== expectedSign) {
      console.error('❌ Firma de webhook inválida');
      return;
    }

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*, plans(id, name, price_monthly, price_yearly), profiles(email, full_name)')
      .eq('payu_reference', reference_sale)
      .single();

    if (!payment) return;

    const statusMap: Record<string, string> = {
      '4': 'approved',
      '6': 'declined',
      '5': 'error',
      '104': 'error',
    };
    const newStatus = statusMap[state_pol] || 'pending';

    await supabaseAdmin
      .from('payments')
      .update({ status: newStatus, payu_response_code: response_code_pol })
      .eq('id', payment.id);

    const userEmail = payment.profiles?.email || '';
    const userName = payment.profiles?.full_name || userEmail;
    const planName = payment.plans?.name || 'Pro';

    if (newStatus === 'approved') {
      const periodEnd = await this.activateSubscription(
        payment.user_id,
        payment.plan_id,
        payment.billing_cycle,
        reference_sale
      );

      await notificationService.sendPaymentConfirmed({
        userId: payment.user_id,
        userEmail,
        userName,
        planName,
        amount: payment.amount,
        billingCycle: payment.billing_cycle,
        reference: reference_sale,
        periodEnd,
        paymentId: payment.id,
      });
    } else if (newStatus === 'declined' || newStatus === 'error') {
      await notificationService.sendPaymentFailed({
        userId: payment.user_id,
        userEmail,
        userName,
        planName,
        reference: reference_sale,
        paymentId: payment.id,
      });
    }
  }
}