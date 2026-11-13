const KEY = 'teviq:purchase-plan';
export function rememberPurchase(search, storage) {
  const plan = new URLSearchParams(search).get('plan');
  if (['starter', 'standard', 'growth'].includes(plan)) {
    try { storage.setItem(KEY, plan); } catch { /* Storage may be unavailable. */ }
    return plan;
  }
  try { const saved = storage.getItem(KEY); return ['starter', 'standard', 'growth'].includes(saved) ? saved : null; } catch { return null; }
}
