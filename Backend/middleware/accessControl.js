import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import Event from '../models/Event.js';
import PlanSettings from '../models/PlanSettings.js';

/**
 * Validates if the user has access to a specific lesson/level/category.
 */
export const checkLessonAccess = async (req, res, next) => {
    try {
        if (!req.params.id) return next();
        if (req.user?.role === 'admin') return next();

        const user = await User.findById(req.user.sub).select('subscription');
        if (!user) return res.status(401).json({ message: "User not recognized." });

        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });

        const planName = user.subscription?.plan || 'FREE';
        const settings = await PlanSettings.findOne({ plan: planName });
        
        // If no settings, allow for safety or restricted logic (let's allow if settings are missing to avoid breaking app)
        if (!settings) return next();

        // 1. Check Level Limit
        if (settings.levelLimit && settings.levelLimit.length > 0) {
            if (!settings.levelLimit.includes(lesson.level || 'Basic')) {
                return res.status(403).json({ 
                    message: `Level '${lesson.level}' is restricted on the ${planName} plan.`, 
                    redirect: "/student/subscription" 
                });
            }
        }

        // 2. Check Category Limit (1st category free policy)
        if (settings.categoryLimit !== null) {
            // Find unique categories for the active level
            // Optimization: Get only the category field and sort by moduleNumber/orderIndex
            const allLessons = await Lesson.find({}, 'category orderIndex').sort({ orderIndex: 1 });
            const categories = [...new Set(allLessons.map(l => l.category).filter(Boolean))];
            
            const allowedCategories = categories.slice(0, settings.categoryLimit);

            if (!allowedCategories.includes(lesson.category)) {
                return res.status(403).json({ 
                    message: `Access Restricted: This category requires a PRO or PREMIUM membership. Only your first category is free!`, 
                    redirect: "/student/subscription",
                    showUpgrade: true
                });
            }
        }

        // 3. Premium Only Flag (Specific Paywall)
        if (lesson.isPremiumOnly && planName === 'FREE') {
            return res.status(403).json({ 
                message: "This specific lesson is reserved for Premium Elite members.", 
                redirect: "/student/subscription" 
            });
        }

        next();
    } catch (e) {
        console.error('Access Control Error:', e);
        // Fallback: Don't crash but maybe restrict?
        res.status(500).json({ message: "Internal access server error. Please try again later." });
    }
};

/**
 * Validates if the user can join an event.
 */
export const checkEventAccess = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') return next();

        const user = await User.findById(req.user.sub);
        const eventId = req.params.id || req.body.eventId;
        
        const planName = user.subscription?.plan || 'FREE';
        const settings = await PlanSettings.findOne({ plan: planName });

        // Check if user has explicitly paid for this specific event
        const hasPaidForEvent = user.subscription?.paidEvents?.some(id => id.toString() === eventId.toString());
        if (hasPaidForEvent) return next();

        if (!settings) return next();

        // Check plan limits
        const limit = settings.eventLimit ?? 0;

        // Special case for FREE plan if limit is 0
        if (planName === 'FREE' && limit === 0) {
            return res.status(403).json({ 
                message: "Premium events require a subscription or one-time payment.", 
                redirect: "/student/subscription",
                requiresPayment: true
            });
        }

        if (limit !== null && (user.subscription?.freeEventsUsedThisCycle || 0) >= limit) {
             return res.status(403).json({ 
                message: "Event limit reached for your plan. Buy this event or upgrade.", 
                redirect: "/student/subscription",
                requiresPayment: true
            });
        }

        // Access granted
        next();
    } catch (e) {
        next(e);
    }
};

/**
 * Validates if the user can join a tutor session.
 */
export const checkTutorAccess = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') return next();

        const user = await User.findById(req.user.sub);
        const tutorId = req.params.id || req.body.tutorId || req.body.teacherId;
        const planName = user.subscription?.plan || 'FREE';
        const settings = await PlanSettings.findOne({ plan: planName });

        // Check if user has explicitly paid for this tutor/session
        const hasPaid = tutorId && user.subscription?.paidTutors?.some(id => id.toString() === tutorId.toString());
        if (hasPaid) return next();

        if (!settings) return next();
        
        const limit = settings.tutorSupportLimit ?? 0;

        if (planName === 'FREE' && limit === 0) {
            return res.status(403).json({ 
                message: "Tutor support is available for PRO and PREMIUM users.", 
                redirect: "/student/subscription" 
            });
        }

        if (limit !== null && (user.subscription?.tutorSupportUsed || 0) >= limit) {
            return res.status(403).json({ 
                message: "Tutor support limit reached for this month.", 
                requiresPayment: true,
                redirect: "/student/subscription" 
            });
        }

        next();
    } catch (e) {
        next(e);
    }
};
