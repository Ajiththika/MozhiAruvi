import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Subscription
router.post('/create-subscription-session', authenticate, paymentController.createSubscriptionSession);
router.get('/verify-session', authenticate, paymentController.verifySubscriptionSession);

// One-time payments
router.post('/create-event-payment', authenticate, paymentController.createEventPaymentSession);
router.post('/create-tutor-payment', authenticate, paymentController.createTutorPaymentSession);

export default router;
