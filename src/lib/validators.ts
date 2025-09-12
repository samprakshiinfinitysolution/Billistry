export function isEmail(x: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}
export function isPhone(x: string) {
  // basic India-style; adapt to your region
  return /^[6-9]\d{9}$/.test(x);
}
export function strongPassword(pwd: string) {
  return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8;
}
