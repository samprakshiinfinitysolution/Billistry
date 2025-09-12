// simple in-memory limiter for OTP (use Redis in prod)
const map = new Map<string, { count: number; resetAt: number }>();

export function canSendOtp(key: string, maxPerWindow = 5, windowSec = 60) {
  const now = Date.now();
  const rec = map.get(key);
  if (!rec || now > rec.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: maxPerWindow - 1, resetIn: windowSec };
  }
  if (rec.count >= maxPerWindow) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((rec.resetAt - now) / 1000) };
  }
  rec.count += 1;
  return { allowed: true, remaining: maxPerWindow - rec.count, resetIn: Math.ceil((rec.resetAt - now) / 1000) };
}
