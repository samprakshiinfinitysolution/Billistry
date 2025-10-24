// lib/cookies.ts
import { NextResponse } from "next/server";
import { serialize } from "cookie";

/**
 * Sets the authentication cookies on the response object.
 * To be used within an API Route Handler.
 * @param response - The NextResponse object.
 * @param accessToken - The access token to set.
 * @param refreshToken - The refresh token to set.
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  const accessTokenCookie = serialize("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15, // 15 min
  });

  const refreshTokenCookie = serialize("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  response.headers.append("Set-Cookie", accessTokenCookie);
  response.headers.append("Set-Cookie", refreshTokenCookie);
}

/**
 * Clears the authentication cookies by setting their maxAge to -1.
 * To be used within an API Route Handler for logout.
 * @param response - The NextResponse object.
 */
export function clearAuthCookies(response: NextResponse) {
  response.headers.append(
    "Set-Cookie",
    serialize("accessToken", "", { path: "/", maxAge: -1 })
  );
  response.headers.append(
    "Set-Cookie",
    serialize("refreshToken", "", { path: "/", maxAge: -1 })
  );
}
