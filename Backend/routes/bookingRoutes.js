import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as bookingController from '../controllers/bookingController.js';
import { checkPlanAccess, limitSessions } from '../middleware/subscriptionLimits.js';

const router = express.Router();

router.use(authenticate);

// Student Logic
router.post('/request', checkPlanAccess, limitSessions, bookingController.createBookingRequest);
router.post('/:id/pay', bookingController.initiateBookingPayment);
router.get('/my-bookings', bookingController.getMyBookings);
router.post('/:id/review', bookingController.addReview);

// Tutor Logic
router.get('/tutor/students', bookingController.getTutorStudents);
router.patch('/:id/confirm', bookingController.confirmBooking);
router.patch('/:id/decline', bookingController.declineBooking);
router.patch('/:id/complete', bookingController.completeBooking);
router.patch('/:id/link', bookingController.updateMeetingLink);
router.patch('/:id/reschedule', bookingController.updateBookingTime);

// Admin Logic
router.get('/admin/mappings', bookingController.getAllTutorStudentMappings);
router.delete('/admin/mappings/:id', bookingController.deleteTutorStudentMapping);

export default router;
