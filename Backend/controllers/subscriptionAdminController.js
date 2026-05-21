import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { PLAN_LIMITS } from '../middleware/subscriptionLimits.js';

/**
 * GET /api/admin/subscriptions
 * List all subscriptions with user info, plan tier, usage tracking and limits.
 */
export async function getAllSubscriptions(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const planFilter = req.query.plan;
        const searchQuery = req.query.search;

        const matchStage = {};
        if (planFilter && planFilter !== 'all') {
            matchStage.planType = planFilter;
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { name: 1, email: 1, role: 1, isActive: 1, createdAt: 1 } }
                    ]
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmpty: true } },
        ];

        if (searchQuery) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.name': { $regex: searchQuery, $options: 'i' } },
                        { 'user.email': { $regex: searchQuery, $options: 'i' } }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { updatedAt: -1 } });

        const [countResult] = await Subscription.aggregate([...pipeline, { $count: 'total' }]);
        const totalItems = countResult?.total || 0;

        const subs = await Subscription.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: limit }
        ]);

        // Attach limits to each subscription for the admin view
        const enriched = subs.map(sub => {
            const limits = PLAN_LIMITS[sub.planType] || PLAN_LIMITS.starter;
            return {
                ...sub,
                limits: {
                    categoryLimit: limits.categoryLimit === Infinity ? 'Unlimited' : limits.categoryLimit,
                    askTutorLimit: limits.askTutorLimit,
                    sessionsLimit: limits.sessionsLimit,
                    eventsLimit: limits.eventsLimit === Infinity ? 'Unlimited' : limits.eventsLimit,
                }
            };
        });

        res.json({
            subscriptions: enriched,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
        });
    } catch (e) {
        next(e);
    }
}

/**
 * PATCH /api/admin/subscriptions/:userId
 * Manually override a user's subscription plan (upgrade/downgrade).
 */
export async function overrideSubscription(req, res, next) {
    try {
        const { userId } = req.params;
        const { planType, isActive, resetUsage } = req.body;

        const validPlans = ['starter', 'plus', 'master'];
        if (planType && !validPlans.includes(planType)) {
            return res.status(400).json({ message: `Invalid planType. Must be one of: ${validPlans.join(', ')}` });
        }

        const updateData = {};
        if (planType) updateData.planType = planType;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (planType && planType !== 'starter') {
            updateData.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        if (resetUsage) {
            updateData['usageTracking.questionsUsed'] = 0;
            updateData['usageTracking.sessionsUsed'] = 0;
            updateData['usageTracking.categoriesAccessed'] = [];
        }

        const sub = await Subscription.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        // Sync to User model
        const planMap = { starter: 'BASIC', plus: 'PLUS', master: 'MASTER' };
        const userPlan = planMap[sub.planType] || 'BASIC';
        await User.findByIdAndUpdate(userId, {
            'subscription.plan': userPlan,
            'subscription.status': sub.isActive ? 'active' : 'canceled',
            'subscription.currentPeriodEnd': sub.endDate,
            isPremium: sub.isActive && sub.planType !== 'starter'
        });

        res.json({ message: 'Subscription overridden successfully', subscription: sub });
    } catch (e) {
        next(e);
    }
}

/**
 * GET /api/admin/subscriptions/stats
 * Aggregate stats — plan distribution, active paid users, etc.
 */
export async function getSubscriptionStats(req, res, next) {
    try {
        const [planDist, activePaid, totalSubs] = await Promise.all([
            Subscription.aggregate([
                { $group: { _id: '$planType', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Subscription.countDocuments({ isActive: true, planType: { $ne: 'starter' } }),
            Subscription.countDocuments()
        ]);

        res.json({
            planDistribution: planDist,
            activePaidUsers: activePaid,
            totalSubscriptions: totalSubs
        });
    } catch (e) {
        next(e);
    }
}
