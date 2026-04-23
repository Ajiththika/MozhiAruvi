import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Subscription
router.get('/plans', authenticate, paymentController.getPlans);
router.post('/create-subscription-session', authenticate, paymentController.createSubscriptionSession);
router.get('/verify-session', authenticate, paymentController.verifySubscriptionSession);

// One-time payments
router.post('/create-event-payment', authenticate, paymentController.createEventPaymentSession);
router.post('/create-tutor-payment', authenticate, paymentController.createTutorPaymentSession);
router.post('/cancel-subscription', authenticate, paymentController.cancelSubscription);
router.post('/upgrade-subscription', authenticate, paymentController.upgradeSubscription);

export default router;
