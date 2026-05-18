import { Router } from 'express';
import { getPlans, getUserSubscription, createPayment, payuWebhook, getPaymentHistory } from '../controllers/payment.controller';

const router = Router();

router.get('/plans', getPlans);
router.get('/subscription', getUserSubscription);
router.post('/create', createPayment);
router.post('/webhook', payuWebhook);
router.get('/history', getPaymentHistory);

export { router as paymentRouter };