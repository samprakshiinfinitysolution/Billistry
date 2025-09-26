export function generateOTP(length = 4) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
export function addSeconds(date: Date, seconds: number) {
  return new Date(date.getTime() + seconds * 1000);
}
