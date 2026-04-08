import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import * as stripeConnect from '../services/stripeConnectService.js';
import * as communication from '../services/communicationService.js';

/**
 * Step 1: Initiate Booking Request (No Payment Yet) 
 */
export async function createBookingRequest(req, res, next) {
    try {
        const { tutorId, date, startTime, duration, requestType, content } = req.body;
        const student = await User.findById(req.user.sub);
        const tutor = await User.findById(tutorId);

        if (!tutor) return res.status(404).json({ message: "Mentor not found." });

        // Calculate theoretical amount for reference
        let amount = tutor.hourlyRate || 30;
        if (requestType === 'live_class') amount = tutor.oneClassFee || 30;
        if (requestType === 'multi_class') amount = tutor.eightClassFee || 200;

        const booking = await Booking.create({
            studentId: student._id,
            tutorId: tutor._id,
            date,
            startTime,
            endTime: "TBD", // Will be finalized after payment/acceptance
            duration: duration || 60,
            amount, // stored for payment phase
            tutorNotes: content, // student's request message
            status: 'pending'
        });

        // Notify Tutor
        await Notification.create({
            user: tutor._id,
            title: "New Session Request!",
            message: `${student.name} wants a Tamil class with you. Check your dashboard to accept.`,
            type: 'booking_request',
            bookingId: booking._id,
        });

        // Email Automation for Tutor
        await communication.sendEmail(tutor.email, 'New Session Request - Mozhi Aruvi', `Hello ${tutor.name}, you have a new student request from ${student.name}. Log in to your dashboard to review and accept the request.`);

        res.json({ message: "Request sent to mentor.", booking });
    } catch (e) { 
        console.error("Booking Request Error:", e);
        next(e); 
    }
}

/**
 * Step 1.5: Initiate Payment (After Mentor Acceptance)
 */
export async function initiateBookingPayment(req, res, next) {
    try {
        const booking = await Booking.findById(req.params.id).populate('studentId tutorId');
        if (!booking) return res.status(404).json({ message: "Booking not found." });
        if (booking.status !== 'confirmed') return res.status(400).json({ message: "Booking must be accepted by mentor first." });
        if (booking.paymentStatus === 'paid') return res.status(400).json({ message: "Already paid." });

        if (!booking.tutorId.stripeAccountId) {
            console.warn(`[Payment] Tutor ${booking.tutorId._id} missing stripeAccountId.`);
            return res.status(400).json({ message: "Mentor hasn't connected their Stripe account yet. Please wait for them to finish setup." });
        }

        const session = await stripeConnect.createSplitPaymentSession(
            booking.studentId, 
            booking.tutorId, 
            booking.amount, 
            {
                bookingId: booking._id.toString(),
                date: booking.date.toISOString(),
                startTime: booking.startTime,
                type: 'tutor_booking'
            }
        );

        res.json({ url: session.url });
    } catch (e) { next(e); }
}

/**
 * ── Step 2: Confirm Booking (Tutor Action) ────────────────────────────────
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
        await communication.sendEmail(student.email, 'Session Accepted - Mozhi Aruvi', `Vanakkam! ${req.user.name} has accepted your Tamil session request. Log in to your dashboard to complete the payment and secure your slot.`);

        res.json({ message: "Booking confirmed.", booking });
    } catch (e) { next(e); }
}

/**
 * ── ❌ Step 2.5: Decline Booking (Tutor Action) ─────────────────────────────
 */
export async function declineBooking(req, res, next) {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, tutorId: req.user.sub });
        if (!booking) return res.status(404).json({ message: "Booking not found." });

        booking.status = 'cancelled';
        await booking.save();

        // Notify Student
        await Notification.create({
            user: booking.studentId,
            title: "Request Declined",
            message: `Unfortunately, the mentor is unable to take your request at this time.`,
            type: 'cancelled',
            bookingId: booking._id,
        });

        // Email Automation
        const student = await User.findById(booking.studentId);
        await communication.sendEmail(student.email, 'Session Request Declined - Mozhi Aruvi', `Hello ${student.name}, unfortunately, ${req.user.name} is unable to accept your Tamil session request at this time. You can explore other tutors on the platform.`);

        res.json({ message: "Booking declined.", booking });
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
 * ──  Step 4: Add Review ────────────────────────────────────────────────────
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
 * ──  Dashboards ────────────────────────────────────────────────────────────
 */
export async function getMyBookings(req, res, next) {
    try {
        const filter = req.user.role === 'teacher' ? { tutorId: req.user.sub } : { studentId: req.user.sub };
        const bookings = await Booking.find(filter)
            .populate('studentId', 'name email profilePhoto')
            .populate('tutorId', 'name email profilePhoto specialization')
            .sort({ date: -1 })
            .limit(50); // Optimization: Prevent massive payloads
        res.json({ bookings });
    } catch (e) { next(e); }
}

/**
 * ── 🔗 Step 5: Update Meeting Link & Notify Student ──────────────────────────
 */
export async function updateMeetingLink(req, res, next) {
    try {
        const { id } = req.params;
        const { meetingLink } = req.body;
        const booking = await Booking.findOne({ _id: id, tutorId: req.user.sub });
        if (!booking) return res.status(404).json({ message: "Booking not found." });

        booking.meetingLink = meetingLink;
        await booking.save();

        // Notify student
        const student = await User.findById(booking.studentId);
        await communication.sendEmail(
            student.email, 
            'Class Link Ready - Mozhi Aruvi', 
            `Vanakkam ${student.name}! Your mentor ${req.user.name} has provided the meeting link for your upcoming Tamil session: ${meetingLink}. You can also find this link in your student dashboard.`
        );

        res.json({ message: "Link updated and student notified.", booking });
    } catch (e) { next(e); }
}

/**
 * ── 🕒 Step 6: Update Booking Time (Reschedule) ──────────────────────────────
 */
export async function updateBookingTime(req, res, next) {
    try {
        const { id } = req.params;
        const { date, startTime } = req.body;
        const booking = await Booking.findOne({ _id: id, tutorId: req.user.sub });
        if (!booking) return res.status(404).json({ message: "Booking not found." });

        if (date) booking.date = date;
        if (startTime) booking.startTime = startTime;
        
        await booking.save();

        // Notify student about rescheduling
        const student = await User.findById(booking.studentId);
        await communication.sendEmail(
            student.email, 
            'Session Rescheduled - Mozhi Aruvi', 
            `Hello ${student.name}, your tutor ${req.user.name} has adjusted the time for your Tamil session. The new time is: ${new Date(booking.date).toDateString()} at ${booking.startTime}.`
        );

        res.json({ message: "Booking rescheduled successfully.", booking });
    } catch (e) { next(e); }
}
