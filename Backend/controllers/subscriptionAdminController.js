import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { PLAN_LIMITS } from '../middleware/subscriptionLimits.js';
import { normalizePlanType, planTypeToUserPlan, getPlanLabel } from '../utils/planTypes.js';

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
            const normalized = normalizePlanType(planFilter);
            matchStage.planType = { $in: [normalized, planFilter, planFilter === 'basic' ? 'starter' : null, planFilter === 'pro' ? 'master' : null].filter(Boolean) };
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
            const planType = normalizePlanType(sub.planType);
            const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.basic;
            const userId = sub.userId?._id || sub.userId;
            return {
                ...sub,
                userId,
                planType,
                planLabel: getPlanLabel(planType),
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

        const validPlans = ['basic', 'plus', 'pro', 'starter', 'master'];
        const normalizedPlan = planType ? normalizePlanType(planType) : undefined;
        if (planType && !validPlans.includes(planType) && !['basic', 'plus', 'pro'].includes(normalizedPlan)) {
            return res.status(400).json({ message: 'Invalid planType. Must be basic, plus, or pro.' });
        }

        const updateData = {};
        if (normalizedPlan) updateData.planType = normalizedPlan;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (normalizedPlan && normalizedPlan !== 'basic') {
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
        const userPlan = planTypeToUserPlan(sub.planType);
        await User.findByIdAndUpdate(userId, {
            'subscription.plan': userPlan,
            'subscription.status': sub.isActive ? 'active' : 'canceled',
            'subscription.currentPeriodEnd': sub.endDate,
            isPremium: sub.isActive && normalizePlanType(sub.planType) !== 'basic',
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
            Subscription.countDocuments({ isActive: true, planType: { $in: ['plus', 'pro', 'master'] } }),
            Subscription.countDocuments()
        ]);

        const merged = {};
        for (const p of planDist) {
            const key = normalizePlanType(p._id);
            merged[key] = (merged[key] || 0) + p.count;
        }
        const planDistribution = Object.entries(merged).map(([id, count]) => ({
            _id: id,
            count,
            label: getPlanLabel(id),
        }));

        res.json({
            planDistribution,
            activePaidUsers: activePaid,
            totalSubscriptions: totalSubs,
        });
    } catch (e) {
        next(e);
    }
}
