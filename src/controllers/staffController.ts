import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User, { IPermissions, IUser } from "@/models/User";
import { UserPayload } from "@/lib/middleware/auth";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";
import Attendance from "@/models/Attendance";
import { uploadFileToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import Business from "@/models/Business";

// ✅ Only shopkeeper and superadmin can manage staff
const canManageStaff = (user: UserPayload) =>
  user.role === "shopkeeper" || user.role === "superadmin";

// ---------------- CREATE STAFF ----------------
export async function createStaff(req: Request, user: UserPayload) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  // Superadmin can specify role, defaults to 'staff'
  const role = (formData.get("role") as "shopkeeper" | "staff") || "staff";
  const businessIdFromRequest = formData.get("businessId") as string;
  const permissions = JSON.parse((formData.get("permissions") as string) || "{}");
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const ifscCode = formData.get("ifscCode") as string;
  const upiId = formData.get("upiId") as string;
  const dob = formData.get("dob") as string;
  const address = formData.get("address") as string;
  const idProofType = formData.get("idProofType") as string;
  const joiningDate = formData.get("joiningDate") as string;
  const jobType = formData.get("jobType") as string;
  const emergencyContact = formData.get("emergencyContact") as string;

  const profileImageFile = formData.get("profileImage") as File | null;
  const idProofFile = formData.get("idProof") as File | null;

  let profileImageUrl: string | undefined;
  let idProofUrl: string | undefined;

  const uploadPromises: Promise<void>[] = [];

  if (profileImageFile) {
    uploadPromises.push(
      uploadFileToCloudinary(profileImageFile, "staff_profiles").then((url) => {
        profileImageUrl = url;
      })
    );
  }
  if (idProofFile) {
    uploadPromises.push(
      uploadFileToCloudinary(idProofFile, "staff_id_proofs").then((url) => {
        idProofUrl = url;
      })
    );
  }

  await Promise.all(uploadPromises);

  // --- Role & Business Logic ---
  if (user.role === "shopkeeper" && role !== "staff") {
    return NextResponse.json(
      { error: "Shopkeepers can only create staff members." },
      { status: 403 }
    );
  }
  if (
    user.role === "superadmin" &&
    role === "staff" &&
    !businessIdFromRequest
  ) {
    return NextResponse.json(
      {
        error: "Superadmin must provide a businessId to create staff.",
      },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Phone is required" },
      { status: 400 }
    );
  }
  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }
  await connectDB();

  // Determine the business ID for the new user
  let targetBusinessId: string | undefined =
    user.role === "shopkeeper" ? user.businessId : businessIdFromRequest;

  try {
    // If creating a shopkeeper, first create their business
    if (role === "shopkeeper") {
      if (user.role !== "superadmin") {
        return NextResponse.json(
          { error: "Only superadmin can create a shopkeeper." },
          { status: 403 }
        );
      }
      const newBusiness = new Business({
        name: `${name}'s Business`, // Or get from form
        owner: null, // Will be set after user is created
        createdBy: user.userId,
      });
      await newBusiness.save();
      targetBusinessId = newBusiness._id.toString();
    }

    if (!targetBusinessId) {
      return NextResponse.json(
        { error: "Business ID is missing." },
        { status: 400 }
      );
    }

    const newUser = new User({
      name,
      email,
      phone,
      role: role,
      business: targetBusinessId,
      permissions:
        Object.keys(permissions).length > 0
          ? permissions
          : DEFAULT_PERMISSIONS[role],
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      dob,
      address,
      idProofType,
      idProofUrl,
      joiningDate,
      jobType,
      emergencyContact,
      profileImageUrl,
    });

    await newUser.save();

    // If a shopkeeper was created, link them as the owner of the new business
    if (role === "shopkeeper") {
      await Business.findByIdAndUpdate(targetBusinessId, { owner: newUser._id });
    }

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    // Clean up uploaded files if user creation fails
    if (profileImageUrl) await deleteFromCloudinary(profileImageUrl);
    if (idProofUrl) await deleteFromCloudinary(idProofUrl);
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
export async function getStaff(req: Request, user: UserPayload) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  // Build query based on user role
  const query: { [key: string]: any } = {};
  if (user.role === "shopkeeper") {
    // Shopkeepers can only see staff in their own business
    query.business = user.businessId;
    query.role = "staff";
  } else if (user.role === "superadmin") {
    // Superadmin gets all shopkeepers and staff, but not other superadmins.
    query.role = { $in: ["shopkeeper", "staff"] };
  }

  const userList = await User.find(query).select(
    "-passwordHash -otp -otpExpiresAt"
  );
  return NextResponse.json({
    success: true,
    users: userList,
  });
}

// ---------------- SINGLE STAFF ----------------
export async function getStaffById(
  req: Request,
  user: UserPayload,
  userId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const query: { [key: string]: any } = { _id: userId };
  if (user.role === "shopkeeper") {
    query.business = user.businessId;
    // A shopkeeper can only view their own staff, not other shopkeepers
    query.role = "staff";
  }

  const targetUser = await User.findOne(query).select(
    "-passwordHash -otp -otpExpiresAt"
  );

  if (!targetUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, user: targetUser });
}

// ---------------- UPDATE STAFF ----------------
export async function updateStaff(
  req: Request,
  user: UserPayload,
  userId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string | undefined;
  const email = formData.get("email") as string | undefined;
  const phone = formData.get("phone") as string | undefined;
  const role = formData.get("role") as "shopkeeper" | "staff" | undefined;
  const permissions = formData.get("permissions")
    ? JSON.parse(formData.get("permissions") as string)
    : undefined;
  const bankName = formData.get("bankName") as string | undefined;
  const accountNumber = formData.get("accountNumber") as string | undefined;
  const ifscCode = formData.get("ifscCode") as string | undefined;
  const upiId = formData.get("upiId") as string | undefined;
  const isActive = formData.get("isActive") ? formData.get("isActive") === 'true' : undefined;
  const dob = formData.get("dob") as string | undefined;
  const address = formData.get("address") as string | undefined;
  const idProofType = formData.get("idProofType") as string | undefined;
  const joiningDate = formData.get("joiningDate") as string | undefined;
  const jobType = formData.get("jobType") as string | undefined;
  const emergencyContact = formData.get("emergencyContact") as string | undefined;

  const profileImageFile = formData.get("profileImage") as File | null;
  const idProofFile = formData.get("idProof") as File | null;

  let profileImageUrl: string | undefined;
  let idProofUrl: string | undefined;

  await connectDB();

  const query: { [key: string]: any } = { _id: userId };
  if (user.role === "shopkeeper") {
    query.business = user.businessId;
    query.role = "staff"; // Shopkeeper can only edit their own staff
  }

  const targetUser: IUser | null = await User.findOne(query);
  if (!targetUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const uploadPromises: Promise<void>[] = [];

  if (profileImageFile) {
    if (targetUser.profileImageUrl) {
      uploadPromises.push(deleteFromCloudinary(targetUser.profileImageUrl));
    }
    uploadPromises.push(
      uploadFileToCloudinary(profileImageFile, "staff_profiles").then((url) => {
        profileImageUrl = url;
      })
    );
  }

  if (idProofFile) {
    if (targetUser.idProofUrl) {
      uploadPromises.push(deleteFromCloudinary(targetUser.idProofUrl));
    }
    uploadPromises.push(
      uploadFileToCloudinary(idProofFile, "staff_id_proofs").then((url) => {
        idProofUrl = url;
      })
    );
  }

  await Promise.all(uploadPromises);

  // Validate required fields if they are being updated
  if (name !== undefined) {
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    targetUser.name = name;
  }
  if (email !== undefined) {
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    targetUser.email = email;
  }
  if (phone !== undefined) {
    if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    targetUser.phone = phone;
  }

  // Only allow role changes if needed, and validate the role.
  if (user.role === "superadmin" && role && role !== targetUser.role) {
    if (role === "staff" || role === "shopkeeper") {
      targetUser.role = role;
    }
  }

  if (permissions) targetUser.permissions = permissions;
  if (bankName !== undefined) targetUser.bankName = bankName;
  if (accountNumber !== undefined) targetUser.accountNumber = accountNumber;
  if (ifscCode !== undefined) targetUser.ifscCode = ifscCode;
  if (upiId !== undefined) targetUser.upiId = upiId;
  if (dob !== undefined) targetUser.dob = dob as any;
  if (address !== undefined) targetUser.address = address;
  if (idProofType !== undefined) targetUser.idProofType = idProofType;
  if (joiningDate !== undefined) targetUser.joiningDate = joiningDate;
  if (jobType !== undefined) targetUser.jobType = jobType;
  if (emergencyContact !== undefined) targetUser.emergencyContact = emergencyContact;
  if (profileImageUrl !== undefined) targetUser.profileImageUrl = profileImageUrl;
  if (idProofUrl !== undefined) targetUser.idProofUrl = idProofUrl;

  if (typeof isActive === "boolean") targetUser.isActive = isActive;
  try {
    await targetUser.save();
    return NextResponse.json({ success: true, user: targetUser });
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.code === 11000
            ? "Email or phone already in use by another user"
            : err.message || "Failed to update user",
      },
      { status: 400 }
    );
  }
}

// ---------------- DELETE STAFF ----------------
export async function deleteStaff(
  req: Request,
  user: UserPayload,
  userId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const query: { [key: string]: any } = { _id: userId };
  if (user.role === "shopkeeper") {
    query.business = user.businessId;
    query.role = "staff"; // Shopkeeper can only delete their own staff
  }

  const targetUser = await User.findOneAndDelete(query);

  if (!targetUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // TODO: Add logic to delete associated data (e.g., attendance) if necessary

  return NextResponse.json({ success: true, message: "User deleted" });
}

// ---------------- UPDATE ATTENDANCE ----------------
export async function updateAttendance(
  req: Request,
  user: UserPayload,
  attendanceId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, notes } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  await connectDB();

  try {
    const attendanceRecord = await Attendance.findById(attendanceId);
    if (!attendanceRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Security check: Ensure the record belongs to a staff member in the user's business
    const query: { [key: string]: any } = { _id: attendanceRecord.staffId };
    if (user.role === "shopkeeper") {
      query.business = user.businessId;
    }

    const staffMember = await User.findOne(query);
    if (!staffMember) {
      return NextResponse.json({ error: "Unauthorized access to attendance record" }, { status: 403 });
    }

    attendanceRecord.status = status;
    attendanceRecord.notes = notes || "";
    await attendanceRecord.save();

    return NextResponse.json(attendanceRecord);
  } catch (error: any) {
    console.error("Failed to update attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// ---------------- DELETE ATTENDANCE ----------------
export async function deleteAttendance(
  req: Request,
  user: UserPayload,
  attendanceId: string
) {
  if (!canManageStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const attendanceRecord = await Attendance.findById(attendanceId);
    if (!attendanceRecord) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    const query: { [key: string]: any } = { _id: attendanceRecord.staffId };
    if (user.role === "shopkeeper") {
      query.business = user.businessId;
    }
    const staffMember = await User.findOne(query);
    if (!staffMember) {
      return NextResponse.json({ error: "Unauthorized access to attendance record" }, { status: 403 });
    }

    await attendanceRecord.deleteOne();
    return NextResponse.json({
      success: true,
      message: "Attendance record deleted",
    });
  } catch (error: any) {
    console.error("Failed to delete attendance:", error);
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
