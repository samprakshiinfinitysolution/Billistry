// lib/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt"; // your jwt util

interface WithAuthOptions {
  roles?: string[]; // Allowed roles e.g. ["superadmin", "shopkeeper"]
}

type Handler = (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: Handler, options: WithAuthOptions = {}) {
  return async (req: NextRequest, context: any) => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.split(" ")[1];
      const decoded = await verifyToken(token); // make sure verifyToken returns user payload

      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      // Role-based access check
      if (options.roles && !options.roles.includes(decoded.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Inject user into context
      context.user = decoded;

      return await handler(req, context);
    } catch (error: any) {
      console.error("Auth error:", error.message);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}
