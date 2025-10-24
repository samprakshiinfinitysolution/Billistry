// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Business from "@/models/Business";
// import "@/models/Business"; // Ensure model is registered
// import { authMiddleware } from "@/lib/middleware/auth";
// import { createAuditLog } from "@/lib/audit";
// import mongoose from "mongoose";

// function getUserId(user: any) {
//   if (!user) return null;
//   return user._id?.toString() || user.id?.toString() || null;
// }

// function sanitizeBusiness(b: any) {
//   return {
//     _id: b._id.toString(),
//     name: b.name,
//     owner: b.owner?.toString() || null,
//     address: b.address || null,
//     phone: b.phone || null,
//     email: b.email || null,
//     gstNumber: b.gstNumber || null,
//     currency: b.currency || null,
//     timezone: b.timezone || null,
//     subscriptionPlan: b.subscriptionPlan || null,
//     subscriptionExpiry: b.subscriptionExpiry || null,
//     isActive: b.isActive,
//     isDeleted: b.isDeleted || false,
//     deletedAt: b.deletedAt || null,
//     createdAt: b.createdAt,
//     updatedAt: b.updatedAt,
//   };
// }

// // ================= GET business by ID =================
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const auth = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
//     if (auth instanceof NextResponse) return auth;

//     const { user } = auth;
//     await connectDB();

//     const { id } = params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });
//     }

//     const business = await Business.findById(id);
//     if (!business || business.isDeleted) {
//       return NextResponse.json({ error: "Business not found" }, { status: 404 });
//     }

//     if (user.role === "shopkeeper" && business.owner.toString() !== getUserId(user)) {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     return NextResponse.json({ business: sanitizeBusiness(business) });
//   } catch (err: any) {
//     console.error("GET /business/:id error:", err);
//     return NextResponse.json({ error: "Server error", details: err.message || err }, { status: 500 });
//   }
// }

// // ================= PUT update business =================
// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const auth = await authMiddleware(req, ["superadmin", "shopkeeper"]);
//     if (auth instanceof NextResponse) return auth;

//     const { user } = auth;
//     await connectDB();

//     const { id } = params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });
//     }

//     const business = await Business.findById(id);
//     if (!business || business.isDeleted) {
//       return NextResponse.json({ error: "Business not found" }, { status: 404 });
//     }

//     if (user.role === "shopkeeper" && business.owner.toString() !== getUserId(user)) {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     const updateData = await req.json();
//     const before = sanitizeBusiness(business);

//     Object.assign(business, updateData, { updatedBy: getUserId(user) });
//     await business.save();

//     await createAuditLog({
//       business: business._id,
//       user: getUserId(user),
//       action: "update",
//       resourceType: "Business",
//       resourceId: business._id,
//       before,
//       after: sanitizeBusiness(business),
//     });

//     return NextResponse.json({ business: sanitizeBusiness(business) });
//   } catch (err: any) {
//     console.error("PUT /business/:id error:", err);
//     return NextResponse.json({ error: "Server error", details: err.message || err }, { status: 500 });
//   }
// }

// // ================= DELETE (soft delete) business =================
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const auth = await authMiddleware(req, ["superadmin", "shopkeeper"]);
//     if (auth instanceof NextResponse) return auth;

//     const { user } = auth;
//     await connectDB();

//     const { id } = params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });
//     }

//     const business = await Business.findById(id);
//     if (!business || business.isDeleted) {
//       return NextResponse.json({ error: "Business not found" }, { status: 404 });
//     }

//     if (user.role === "shopkeeper" && business.owner.toString() !== getUserId(user)) {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     const before = sanitizeBusiness(business);
//     business.isDeleted = true;
//     business.deletedAt = new Date();
//     business.updatedBy = getUserId(user);
//     await business.save();

//     await createAuditLog({
//       business: business._id,
//       user: getUserId(user),
//       action: "delete",
//       resourceType: "Business",
//       resourceId: business._id,
//       before,
//     });

//     return NextResponse.json({ message: "Business deleted" });
//   } catch (err: any) {
//     console.error("DELETE /business/:id error:", err);
//     return NextResponse.json({ error: "Server error", details: err.message || err }, { status: 500 });
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { authMiddleware } from "@/lib/middleware/auth";
import { createAuditLog } from "@/lib/audit";
import mongoose from "mongoose";

type Params = { id: string };

function getUserId(user: any) {
  return user?._id?.toString?.() || user?.id?.toString?.() || null;
}

function sanitizeBusiness(b: any) {
  return {
    _id: b._id.toString(),
    name: b.name,
    owner: b.owner?.toString() || null,
    address: b.address || null,
    phone: b.phone || null,
    email: b.email || null,
    gstNumber: b.gstNumber || null,
    currency: b.currency || null,
    timezone: b.timezone || null,
    subscriptionPlan: b.subscriptionPlan || null,
    subscriptionExpiry: b.subscriptionExpiry || null,
    isActive: b.isActive,
    isDeleted: b.isDeleted || false,
    deletedAt: b.deletedAt || null,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

// ================= GET Business by ID =================
export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params as Params;
    const auth = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
    if (auth instanceof NextResponse) return auth;
    
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });

    const business = await Business.findById(id);
    if (!business || business.isDeleted)
      return NextResponse.json({ error: "Business not found" }, { status: 404 });

    if (auth.role === "shopkeeper" && business.owner.toString() !== getUserId(auth))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    return NextResponse.json({ success: true, data: sanitizeBusiness(business) }, { status: 200 });
  } catch (err: any) {
    console.error("GET /business/:id error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ================= PUT Update Business =================
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = params as Params;
    const auth = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (auth instanceof NextResponse) return auth;
    
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });

    const business = await Business.findById(id);
    if (!business || business.isDeleted)
      return NextResponse.json({ error: "Business not found" }, { status: 404 });

    if (auth.role === "shopkeeper" && business.owner.toString() !== getUserId(auth))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const body = await req.json();
    const before = sanitizeBusiness(business);

    Object.assign(business, body, { updatedBy: getUserId(auth) });
    await business.save();

    await createAuditLog({
      business: business._id,
      user: getUserId(auth),
      action: "update",
      resourceType: "Business",
      resourceId: business._id,
      before,
      after: sanitizeBusiness(business),
    });

    return NextResponse.json({ success: true, data: sanitizeBusiness(business) }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /business/:id error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ================= DELETE (Soft Delete) =================
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id } = params as Params;
    const auth = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (auth instanceof NextResponse) return auth;
    
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id))
      return NextResponse.json({ error: "Invalid Business ID" }, { status: 400 });

    const business = await Business.findById(id);
    if (!business || business.isDeleted)
      return NextResponse.json({ error: "Business not found" }, { status: 404 });

    if (auth.role === "shopkeeper" && business.owner.toString() !== getUserId(auth))
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const before = sanitizeBusiness(business);

    business.isDeleted = true;
    business.deletedAt = new Date();
    business.updatedBy = getUserId(auth);
    await business.save();

    await createAuditLog({
      business: business._id,
      user: getUserId(auth),
      action: "delete",
      resourceType: "Business",
      resourceId: business._id,
      before,
    });

    return NextResponse.json({ success: true, message: "Business deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /business/:id error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
