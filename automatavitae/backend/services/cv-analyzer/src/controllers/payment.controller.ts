import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

 
const paymentService = new PaymentService();
 
// GET /api/payments/plans
export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { supabase } = await import('../config/supabase');
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
 
    if (error) throw error;
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};
 
// GET /api/payments/subscription
export const getUserSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
 
    const { supabase } = await import('../config/supabase');
    const { data, error } = await supabase
      .rpc('get_user_plan', { p_user_id: userId });
 
    if (error) throw error;
    res.json({ success: true, data: data?.[0] || { plan_slug: 'free' } });
  } catch (error) {
    next(error);
  }
};
 
// POST /api/payments/create
export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, planSlug, billingCycle, userEmail, userName } = req.body;
 
    if (!userId || !planSlug || !billingCycle || !userEmail) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
 
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({ error: 'billingCycle debe ser monthly o yearly' });
    }
 
    const result = await paymentService.createPayment({
      userId, planSlug, billingCycle, userEmail, userName: userName || userEmail,
    });
 
    res.json({ success: result.success, data: result });
  } catch (error: any) {
    if (error.message?.includes('gratuito')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};
 
// POST /api/payments/webhook  (llamado por PayU)
export const payuWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📩 Webhook PayU recibido:', req.body);
    await paymentService.processWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(200).send('OK'); // Siempre responder 200 a PayU
  }
};
 
// GET /api/payments/history
export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
 
    const { supabase } = await import('../config/supabase');
    const { data, error } = await supabase
      .from('payments')
      .select('*, plans(name, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
 
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};