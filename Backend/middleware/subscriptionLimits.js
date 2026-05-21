import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import Lesson from '../models/Lesson.js';

export const PLAN_LIMITS = {
  starter: {
    categoryLimit: 1,
    lessonAccess: 'limited',
    askTutorLimit: 10,
    eventsLimit: 2,
    sessionsLimit: 0
  },
  plus: {
    categoryLimit: 50,
    lessonAccess: 'full',
    askTutorLimit: 50,
    eventsLimit: 8,
    sessionsLimit: 6
  },
  master: {
    categoryLimit: Infinity,
    lessonAccess: 'full',
    askTutorLimit: 100,
    eventsLimit: Infinity,
    sessionsLimit: 12
  }
};

/**
 * Ensures the req.subscription object is populated for the authenticated user.
 * If no subscription exists, a default starter plan is created.
 */
export const checkPlanAccess = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        planType: 'starter',
        isActive: true, // Starter/Free is active by default
        startDate: new Date(),
        usageTracking: {
          questionsUsed: 0,
          categoriesAccessed: [],
          sessionsUsed: 0
        }
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error in checkPlanAccess middleware:', error);
    next(error);
  }
};

/**
 * Gating categories based on subscription tier limits.
 */
export const limitCategoryAccess = async (req, res, next) => {
  try {
    if (!req.subscription) {
      return res.status(500).json({ message: "Subscription context missing" });
    }

    const limits = PLAN_LIMITS[req.subscription.planType] || PLAN_LIMITS.starter;

    // Check if category limit is unlimited
    if (limits.categoryLimit === Infinity) {
      return next();
    }

    let categoryName = req.body.category || req.query.category;

    // If accessing lesson details or questions, retrieve category from Lesson
    if (!categoryName && req.params.id) {
      if (mongoose.isValidObjectId(req.params.id)) {
        const lesson = await Lesson.findById(req.params.id).select('category');
        if (lesson) {
          categoryName = lesson.category;
        }
      }
    }

    if (!categoryName) {
      return next();
    }

    const accessed = req.subscription.usageTracking?.categoriesAccessed || [];

    // If category already unlocked, grant access
    if (accessed.includes(categoryName)) {
      return next();
    }

    // Check if user is trying to access a new category and has reached their limit
    if (accessed.length >= limits.categoryLimit) {
      return res.status(403).json({
        message: "Upgrade to unlock more categories! You have reached the limit of your plan.",
        limitReached: true,
        redirect: "/student/subscription"
      });
    }

    // Unlock new category
    req.subscription.usageTracking.categoriesAccessed.push(categoryName);
    await req.subscription.save();
    next();
  } catch (error) {
    console.error('Error in limitCategoryAccess middleware:', error);
    next(error);
  }
};

/**
 * Gating tutor questions based on monthly plan limits.
 */
export const limitQuestions = async (req, res, next) => {
  try {
    if (!req.subscription) {
      return res.status(500).json({ message: "Subscription context missing" });
    }

    const limits = PLAN_LIMITS[req.subscription.planType] || PLAN_LIMITS.starter;
    const questionsUsed = req.subscription.usageTracking?.questionsUsed || 0;

    if (questionsUsed >= limits.askTutorLimit) {
      return res.status(403).json({
        message: `Ask-a-Tutor question limit of ${limits.askTutorLimit} reached for this month. Upgrade to ask more!`,
        limitReached: true,
        redirect: "/student/subscription"
      });
    }

    // Increment question count
    req.subscription.usageTracking.questionsUsed = questionsUsed + 1;
    await req.subscription.save();
    next();
  } catch (error) {
    console.error('Error in limitQuestions middleware:', error);
    next(error);
  }
};

/**
 * Gating booking sessions based on monthly plan limits.
 */
export const limitSessions = async (req, res, next) => {
  try {
    if (!req.subscription) {
      return res.status(500).json({ message: "Subscription context missing" });
    }

    const limits = PLAN_LIMITS[req.subscription.planType] || PLAN_LIMITS.starter;
    const sessionsUsed = req.subscription.usageTracking?.sessionsUsed || 0;

    if (sessionsUsed >= limits.sessionsLimit) {
      return res.status(403).json({
        message: `1-to-1 class limit of ${limits.sessionsLimit} reached for this month. Upgrade to book more sessions!`,
        limitReached: true,
        redirect: "/student/subscription"
      });
    }

    // Increment session booking count
    req.subscription.usageTracking.sessionsUsed = sessionsUsed + 1;
    await req.subscription.save();
    next();
  } catch (error) {
    console.error('Error in limitSessions middleware:', error);
    next(error);
  }
};
