/** Display labels for subscription plans (Basic, Plus, Pro) */
export const PLAN_DISPLAY: Record<string, { label: string; color: string }> = {
  basic: { label: "Basic", color: "bg-slate-50 text-slate-500 border-slate-200" },
  starter: { label: "Basic", color: "bg-slate-50 text-slate-500 border-slate-200" },
  plus: { label: "Plus", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  pro: { label: "Pro", color: "bg-amber-50 text-amber-600 border-amber-200" },
  master: { label: "Pro", color: "bg-amber-50 text-amber-600 border-amber-200" },
};

export function normalizePlanKey(plan?: string): string {
  if (!plan) return "basic";
  const t = plan.toLowerCase();
  if (t === "starter" || t === "basic") return "basic";
  if (t === "master" || t === "pro") return "pro";
  if (t === "plus") return "plus";
  return t;
}

export function getPlanDisplay(plan?: string) {
  const key = normalizePlanKey(plan);
  return PLAN_DISPLAY[key] || { label: plan || "Basic", color: "bg-slate-50 text-slate-500 border-slate-200" };
}
