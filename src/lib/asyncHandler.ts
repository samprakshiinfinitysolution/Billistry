// // lib/asyncHandler.ts
// import { NextRequest, NextResponse } from "next/server";

// export const asyncHandler = (
//   fn: (req: NextRequest) => Promise<NextResponse>
// ) => {
//   return async (req: NextRequest) => {
//     try {
//       return await fn(req);
//     } catch (error: any) {
//       console.error("API Error:", error);
//       return NextResponse.json(
//         { success: false, error: error?.message || "Internal Server Error" },
//         { status: 500 }
//       );
//     }
//   };
// };



// lib/asyncHandler.ts
import { NextRequest, NextResponse } from "next/server";

export const asyncHandler = (
  fn: (req: NextRequest, context?: any) => Promise<NextResponse>
) => {
  return async (req: NextRequest, context?: any) => {
    try {
      return await fn(req, context);
    } catch (error: any) {
      console.error("API Error:", error);
      return NextResponse.json(
        { success: false, error: error?.message || "Internal Server Error" },
        { status: 500 }
      );
    }
  };
};
