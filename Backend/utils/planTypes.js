/**
 * Canonical subscription plan types: basic | plus | pro
 * Maps legacy DB values (starter, master) for backward compatibility.
 */

export const PLAN_TYPES = ['basic', 'plus', 'pro'];

export const PLAN_LIMITS = {
  basic: {
    categoryLimit: 1,
    lessonAccess: 'limited',
    askTutorLimit: 10,
    eventsLimit: 2,
    sessionsLimit: 0,
  },
  plus: {
    categoryLimit: 50,
    lessonAccess: 'full',
    askTutorLimit: 50,
    eventsLimit: 8,
    sessionsLimit: 6,
  },
  pro: {
    categoryLimit: Infinity,
    lessonAccess: 'full',
    askTutorLimit: 100,
    eventsLimit: Infinity,
    sessionsLimit: 12,
  },
};

/** Normalize stored plan type to basic | plus | pro */
export function normalizePlanType(planType) {
  if (!planType) return 'basic';
  const t = String(planType).toLowerCase();
  if (t === 'starter' || t === 'basic') return 'basic';
  if (t === 'plus') return 'plus';
  if (t === 'master' || t === 'pro') return 'pro';
  return 'basic';
}

/** User.subscription.plan field (BASIC | PLUS | PRO) */
export function planTypeToUserPlan(planType) {
  const map = { basic: 'BASIC', plus: 'PLUS', pro: 'PRO' };
  return map[normalizePlanType(planType)] || 'BASIC';
}

/** From User plan enum to subscription planType */
export function userPlanToPlanType(userPlan) {
  if (!userPlan) return 'basic';
  const t = String(userPlan).toUpperCase();
  if (t === 'BASIC') return 'basic';
  if (t === 'PLUS') return 'plus';
  if (t === 'PRO' || t === 'MASTER') return 'pro';
  return 'basic';
}

export function getPlanLabel(planType) {
  const labels = { basic: 'Basic', plus: 'Plus', pro: 'Pro' };
  return labels[normalizePlanType(planType)] || 'Basic';
}
