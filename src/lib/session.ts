import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

// Payload type for session
export type SessionPayload = {
  sub: string;           // user id
  role: "superadmin" | "staff" | "shopkeeper";
  name: string;
  phone?: string;
  email?: string;
};

// Sign a JWT token
// export function signSession(payload: SessionPayload, expiresIn = "7d") {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn });
// }

// Verify a JWT token
export function verifySession<T = SessionPayload>(token?: string): T | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hash?: string) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

// Get session from cookie (server-side)
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    return verifySession(token);
  } catch {
    return null;
  }
}
