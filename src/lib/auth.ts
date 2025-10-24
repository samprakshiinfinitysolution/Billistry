import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET not set');

export type SessionPayload = {
  sub: string;           // user id
  role: 'superadmin' | 'supplier' | 'staff';
  perms: Record<string, boolean>;
  name: string;
  phone: string;
  email?: string;
};

// export function signSession(payload: SessionPayload, expiresIn = '7d') {
//   return jwt.sign({ ...payload }, JWT_SECRET, { expiresIn });
// }
export function verifySession<T = SessionPayload>(token?: string) {
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as T; } catch { return null; }
}
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
export async function comparePassword(password: string, hash?: string) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  return verifySession(token);
}
