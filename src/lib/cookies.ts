// lib/cookies.ts
import { cookies } from "next/headers";

export function setAuthCookies(accessToken: string, refreshToken: string) {
  cookies().set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15, // 15 min
  });

  cookies().set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookies() {
  cookies().delete("accessToken");
  cookies().delete("refreshToken");
}
