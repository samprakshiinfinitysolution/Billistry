// import { NextResponse } from "next/server";

// import { connectDB } from '@/lib/db';
// import { createHSN, searchHSN } from "@/controllers/hsnController";

// // ✅ GET /api/hsn?search=code_or_name
// export async function GET(req: Request) {
//   await connectDB();
//   const { search } = Object.fromEntries(new URL(req.url).searchParams);
//   const results = await searchHSN(search as string);
//   return NextResponse.json(results);
// }

// // ✅ POST /api/hsn
// export async function POST(req: Request) {
//   await connectDB();
//   const body = await req.json();
//   const hsn = await createHSN(body);
//   return NextResponse.json(hsn, { status: 201 });
// }


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createHSN, searchHSN } from "@/controllers/hsnController";

// ✅ GET /api/hsn?search=code_or_name
export async function GET(req: Request) {
  try {
    await connectDB();
    const { search } = Object.fromEntries(new URL(req.url).searchParams);

    const results = await searchHSN(search as string);
    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ POST /api/hsn (single or multiple)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Agar array bheja hai to multiple create
    if (Array.isArray(body)) {
      const hsns = await Promise.all(body.map((item) => createHSN(item)));
      return NextResponse.json(hsns, { status: 201 });
    }

    // Single object ho to ek create karo
    const hsn = await createHSN(body);
    return NextResponse.json(hsn, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
