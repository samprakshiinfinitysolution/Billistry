// // app/api/business/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Business from "@/models/Business";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// function getUser(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;
//   if (!token) return null;
//   try {
//     return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
//   } catch {
//     return null;
//   }
// }

// // GET: list businesses
// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();
//     const user = getUser(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     let businesses;
//     if (user.role === "shopkeeper") {
//       businesses = await Business.find({ owner: user.id, isDeleted: false });
//     } else {
//       businesses = await Business.find({ isDeleted: false });
//     }

//     return NextResponse.json({ success: true, businesses });
//   } catch (error: any) {
//     console.error("GET Business Error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // POST: create new business
// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();
//     const user = getUser(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await req.json();
//     const { name, address, phone, email, gstNumber, currency, timezone } = body;

//     if (!name) return NextResponse.json({ error: "Business name is required" }, { status: 400 });

//     const ownerId = user.role === "shopkeeper" ? user.id : body.owner;

//     const business = await Business.create({
//       name,
//       owner: ownerId,
//       address,
//       phone,
//       email,
//       gstNumber,
//       currency,
//       timezone,
//       createdBy: user.id,
//       updatedBy: user.id,
//     });

//     return NextResponse.json({ success: true, business });
//   } catch (error: any) {
//     console.error("POST Business Error:", error);
//     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
//   }
// }

// // PUT: update business
// export async function PUT(req: NextRequest) {
//   try {
//     await connectDB();
//     const user = getUser(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await req.json();
//     const { id, ...updateData } = body;
//     if (!id) return NextResponse.json({ error: "Business ID is required" }, { status: 400 });

//     const business = await Business.findById(id);
//     if (!business || business.isDeleted) return NextResponse.json({ error: "Business not found" }, { status: 404 });

//     // Shopkeepers can only update their own businesses
//     if (user.role === "shopkeeper" && business.owner.toString() !== user.id)
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     Object.assign(business, updateData, { updatedBy: user.id });
//     await business.save();

//     return NextResponse.json({ success: true, business });
//   } catch (error: any) {
//     console.error("PUT Business Error:", error);
//     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
//   }
// }

// // DELETE: soft delete business
// export async function DELETE(req: NextRequest) {
//   try {
//     await connectDB();
//     const user = getUser(req);
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) return NextResponse.json({ error: "Business ID required" }, { status: 400 });

//     const business = await Business.findById(id);
//     if (!business || business.isDeleted) return NextResponse.json({ error: "Business not found" }, { status: 404 });

//     if (user.role === "shopkeeper" && business.owner.toString() !== user.id)
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     business.isDeleted = true;
//     business.deletedAt = new Date();
//     business.updatedBy = user.id;
//     await business.save();

//     return NextResponse.json({ success: true, message: "Business deleted" });
//   } catch (error: any) {
//     console.error("DELETE Business Error:", error);
//     return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";

// GET: list businesses
export async function GET(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const businesses =
    user.role === "shopkeeper"
      ? await Business.find({ owner: user.id, isDeleted: false })
      : await Business.find({ isDeleted: false });

  return NextResponse.json({ success: true, businesses });
}

// POST: create new business
export async function POST(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { name, address, phone, email, gstNumber, currency, timezone } = body;

  if (!name) return NextResponse.json({ error: "Business name is required" }, { status: 400 });

  const ownerId = user.role === "shopkeeper" ? user.id : body.owner;

  const business = await Business.create({
    name,
    owner: ownerId,
    address,
    phone,
    email,
    gstNumber,
    currency,
    timezone,
    createdBy: user.id,
    updatedBy: user.id,
  });

  return NextResponse.json({ success: true, business });
}

// PUT: update business
export async function PUT(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { id, ...updateData } = body;
  if (!id) return NextResponse.json({ error: "Business ID is required" }, { status: 400 });

  const business = await Business.findById(id);
  if (!business || business.isDeleted) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (user.role === "shopkeeper" && business.owner.toString() !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  Object.assign(business, updateData, { updatedBy: user.id });
  await business.save();

  return NextResponse.json({ success: true, business });
}

// DELETE: soft delete business
export async function DELETE(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Business ID required" }, { status: 400 });

  const business = await Business.findById(id);
  if (!business || business.isDeleted) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (user.role === "shopkeeper" && business.owner.toString() !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  business.isDeleted = true;
  business.deletedAt = new Date();
  business.updatedBy = user.id;
  await business.save();

  return NextResponse.json({ success: true, message: "Business deleted" });
}
