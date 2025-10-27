// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import { authMiddleware, UserPayload } from "@/lib/middleware/auth";
// import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// // Helper: Check if current user is allowed to manage staff
// const canManageStaff = (user: UserPayload) =>
//   user.role === "shopkeeper" || user.role === "superadmin";

// export async function createStaff(req: NextRequest, user: UserPayload) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { name, email, phone, role, permissions } = await req.json();

//   if (!name || !email || !phone) {
//     return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
//   }

//   await connectDB();

//   // Create staff under shopkeeper's business
//   const staff = new User({
//     name,
//     email,
//     phone,
//     role: role || "staff",
//     business: user.businessId,
//     permissions: permissions || DEFAULT_PERMISSIONS.staff,
//   });

//   await staff.save();

//   return NextResponse.json({ success: true, staff });
// }

// export async function getStaff(req: NextRequest, user: UserPayload) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   await connectDB();

//   // Only fetch staff of the same business
//   const staffList = await User.find({ business: user.businessId, role: "staff" }).select(
//     "name email phone role permissions"
//   );

//   return NextResponse.json(staffList);
// }

// export async function updateStaff(req: NextRequest, user: UserPayload, staffId: string) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { name, email, phone, role, permissions } = await req.json();
//   await connectDB();

//   const staff = await User.findOne({ _id: staffId, business: user.businessId, role: "staff" });
//   if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

//   if (name) staff.name = name;
//   if (email) staff.email = email;
//   if (phone) staff.phone = phone;
//   if (role) staff.role = role;
//   if (permissions) staff.permissions = permissions;

//   await staff.save();

//   return NextResponse.json({ success: true, staff });
// }

// export async function deleteStaff(req: NextRequest, user: UserPayload, staffId: string) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   await connectDB();

//   const staff = await User.findOneAndDelete({ _id: staffId, business: user.businessId, role: "staff" });
//   if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

//   return NextResponse.json({ success: true, message: "Staff deleted" });
// }



// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import { UserPayload } from "@/lib/middleware/auth";
// import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// // Only shopkeeper and superadmin can manage staff
// const canManageStaff = (user: UserPayload) =>
//   user.role === "shopkeeper" || user.role === "superadmin";

// // Create Staff
// export async function createStaff(req: NextRequest, user: UserPayload) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { name, email, phone, role, permissions } = await req.json();

//   if (!name || !email || !phone) {
//     return NextResponse.json(
//       { error: "Name, email and phone are required" },
//       { status: 400 }
//     );
//   }

//   await connectDB();

//   try {
//     const staff = new User({
//       name,
//       email,
//       phone,
//       role: role || "staff",
//       business: user.businessId,
//       permissions: permissions || DEFAULT_PERMISSIONS.staff,
//     });

//     await staff.save();

//     return NextResponse.json({ success: true, staff });
//   } catch (err: any) {
//     return NextResponse.json(
//       {
//         error:
//           err.code === 11000
//             ? "Email or phone already in use"
//             : "Failed to create staff",
//       },
//       { status: 400 }
//     );
//   }
// }

// // Get all staff
// export async function getStaff(_: NextRequest, user: UserPayload) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   await connectDB();

//   const staffList = await User.find({
//     business: user.businessId,
//     role: { $in: ["staff", "manager"] },
//   }).select("name email phone role permissions");

//   return NextResponse.json(staffList);
// }

// // Get single staff
// export async function getStaffById(
//   _: NextRequest,
//   user: UserPayload,
//   staffId: string
// ) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   await connectDB();

//   const staff = await User.findOne({
//     _id: staffId,
//     business: user.businessId,
//     role: { $in: ["staff", "manager"] },
//   }).select("name email phone role permissions");

//   if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

//   return NextResponse.json(staff);
// }

// // Update staff
// export async function updateStaff(
//   req: NextRequest,
//   user: UserPayload,
//   staffId: string
// ) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { name, email, phone, role, permissions } = await req.json();

//   await connectDB();

//   const staff = await User.findOne({
//     _id: staffId,
//     business: user.businessId,
//     role: { $in: ["staff", "manager"] },
//   });
//   if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

//   if (name) staff.name = name;
//   if (email) staff.email = email;
//   if (phone) staff.phone = phone;
//   if (role) staff.role = role;
//   if (permissions) staff.permissions = permissions;

//   await staff.save();

//   return NextResponse.json({ success: true, staff });
// }

// // Delete staff
// export async function deleteStaff(
//   _: NextRequest,
//   user: UserPayload,
//   staffId: string
// ) {
//   if (!canManageStaff(user)) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   await connectDB();

//   const staff = await User.findOneAndDelete({
//     _id: staffId,
//     business: user.businessId,
//     role: { $in: ["staff", "manager"] },
//   });

//   if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

//   return NextResponse.json({ success: true, message: "Staff deleted" });
// }


















import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { UserPayload } from "@/lib/middleware/auth";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// ✅ Only shopkeeper and superadmin can manage staff
const canManageStaff = (user: UserPayload) =>
  user.role === "shopkeeper" || user.role === "superadmin";

// ---------------- CREATE STAFF ----------------
export async function createStaff(req: NextRequest, user: UserPayload) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email, phone, role, permissions } = await req.json();

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Name and phone are required" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const staff = new User({
      name,
      email,
      phone,
      role: role || "staff",
      business: user.businessId,
      permissions: permissions || DEFAULT_PERMISSIONS.staff,
    });

    await staff.save();

    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.code === 11000
            ? "Email or phone already in use"
            : err.message || "Failed to create staff",
      },
      { status: 400 }
    );
  }
}

// ---------------- LIST STAFF ----------------
export async function getStaff(_: NextRequest, user: UserPayload) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const staffList = await User.find({
    business: user.businessId,
    role: "staff",
  }).select("name email phone role permissions isActive");

  return NextResponse.json(staffList);
}

// ---------------- SINGLE STAFF ----------------
export async function getStaffById(
  _: NextRequest,
  user: UserPayload,
  staffId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const staff = await User.findOne({
    _id: staffId,
    business: user.businessId,
    role: "staff",
  }).select("name email phone role permissions isActive");

  if (!staff)
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  return NextResponse.json(staff);
}

// ---------------- UPDATE STAFF ----------------
export async function updateStaff(
  req: NextRequest,
  user: UserPayload,
  staffId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email, phone, role, permissions, isActive } = await req.json();

  await connectDB();

  const staff = await User.findOne({
    _id: staffId,
    business: user.businessId,
    role: "staff",
  });
  if (!staff)
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  if (name) staff.name = name;
  if (email) staff.email = email;
  if (phone) staff.phone = phone;
  if (role) staff.role = role;
  if (permissions) staff.permissions = permissions;
  if (typeof isActive === "boolean") staff.isActive = isActive;

  await staff.save();

  return NextResponse.json({ success: true, staff });
}

// ---------------- DELETE STAFF ----------------
export async function deleteStaff(
  _: NextRequest,
  user: UserPayload,
  staffId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const staff = await User.findOneAndDelete({
    _id: staffId,
    business: user.businessId,
    role: "staff",
  });

  if (!staff)
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Staff deleted" });
}
