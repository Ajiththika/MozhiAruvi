import { api } from "@/lib/api";

export async function createSubscriptionSession(plan: 'PRO' | 'PREMIUM' | 'BUSINESS', cycle: 'monthly' | 'yearly', seats?: number) {
  const res = await api.post<{ url: string }>("/payments/create-subscription-session", { plan, cycle, seats });
  return res.data;
}

export async function createEventPayment(eventId: string) {
  const res = await api.post<{ url: string }>("/payments/create-event-payment", { eventId });
  return res.data;
}

export async function createTutorPayment(tutorId: string, isPackage?: boolean) {
  const res = await api.post<{ url: string }>("/payments/create-tutor-payment", { tutorId, isPackage });
  return res.data;
}

export async function verifySubscriptionSession(sessionId: string) {
  const res = await api.get<{ message: string, user: any, accessToken?: string }>(`/payments/verify-session?sessionId=${sessionId}`);
  return res.data;
}

export async function cancelSubscription() {
  const res = await api.post<{ message: string }>("/payments/cancel-subscription");
  return res.data;
}

export async function upgradeSubscription(plan: 'PRO' | 'PREMIUM', cycle: 'monthly' | 'yearly') {
  const res = await api.post<{ message: string, user: any }>("/payments/upgrade-subscription", { plan, cycle });
  return res.data;
}

