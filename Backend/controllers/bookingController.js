import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import * as stripeConnect from '../services/stripeConnectService.js';
import * as communication from '../services/communicationService.js';

/**
 * ── 💳 Step 1: Initiate Booking (Stripe Session) ──────────────────────────────
 */
export async function createBookingSession(req, res, next) {
    try {
        const { tutorId, date, startTime, endTime, duration } = req.body;
        const student = await User.findById(req.user.sub);
        const tutor = await User.findById(tutorId);

        if (!tutor || !tutor.isStripeVerified) {
            return res.status(400).json({ message: "Tutor is not verified for payments yet." });
        }

        const amount = (tutor.hourlyRate || 20) * (duration / 60);

        const metadata = {
            date,
            startTime,
            endTime,
            duration: String(duration),
        };

        const session = await stripeConnect.createSpitPaymentSession(student, tutor, amount, metadata);
        res.json({ url: session.url });
    } catch (e) { next(e); }
}

/**
 * ── ✅ Step 2: Confirm Booking (Tutor Action) ────────────────────────────────
 */
export async function confirmBooking(req, res, next) {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, tutorId: req.user.sub });
        if (!booking) return res.status(404).json({ message: "Booking not found." });

        booking.status = 'confirmed';
        await booking.save();

        // Notify Student
        await Notification.create({
            user: booking.studentId,
            title: "Session Confirmed!",
            message: `Your Tamil session with the tutor has been confirmed for ${booking.date.toDateString()}.`,
            type: 'booking_confirmed',
            bookingId: booking._id,
        });

        // Email Automation
        const student = await User.findById(booking.studentId);
        await communication.sendEmail(student.email, 'Session Confirmed - Mozhi Aruvi', `Your session is locked in! Check your dashboard for details.`);

        res.json({ message: "Booking confirmed.", booking });
    } catch (e) { next(e); }
}

/**
 * ── 🎓 Step 3: Complete Session ─────────────────────────────────────────────
 */
export async function completeBooking(req, res, next) {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, tutorId: req.user.sub });
        if (!booking) return res.status(404).json({ message: "Booking not found." });

        booking.status = 'completed';
        await booking.save();

        // Notify Student to Review
        await Notification.create({
            user: booking.studentId,
            title: "How was your class?",
            message: "Your session is complete. Please leave a review for your tutor!",
            type: 'session_completed',
            bookingId: booking._id,
        });

        res.json({ message: "Session marked as completed.", booking });
    } catch (e) { next(e); }
}

/**
 * ── ⭐ Step 4: Add Review ────────────────────────────────────────────────────
 */
export async function addReview(req, res, next) {
    try {
        const { rating, comment } = req.body;
        const booking = await Booking.findOne({ _id: req.params.id, studentId: req.user.sub });
        if (!booking || booking.status !== 'completed') {
            return res.status(400).json({ message: "Only completed sessions can be reviewed." });
        }

        booking.review = { rating, comment, createdAt: new Date() };
        await booking.save();

        res.json({ message: "Review submitted. Thank you!", booking });
    } catch (e) { next(e); }
}

/**
 * ── 📊 Dashboards ────────────────────────────────────────────────────────────
 */
export async function getMyBookings(req, res, next) {
    try {
        const filter = req.user.role === 'teacher' ? { tutorId: req.user.sub } : { studentId: req.user.sub };
        const bookings = await Booking.find(filter)
            .populate('studentId', 'name email profilePhoto')
            .populate('tutorId', 'name email profilePhoto specialization')
            .sort({ date: -1 });
        res.json({ bookings });
    } catch (e) { next(e); }
}
