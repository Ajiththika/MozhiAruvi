import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.use(authenticate);

// Student Logic
router.post('/initiate', bookingController.createBookingSession);
router.get('/my-bookings', bookingController.getMyBookings);
router.post('/:id/review', bookingController.addReview);

// Tutor Logic
router.patch('/:id/confirm', bookingController.confirmBooking);
router.patch('/:id/complete', bookingController.completeBooking);

export default router;
