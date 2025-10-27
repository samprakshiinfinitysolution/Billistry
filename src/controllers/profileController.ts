import Profile from "@/models/profile";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";

export async function createProfile(req: NextRequest, user: UserPayload, formData: FormData) {
  await connectDB();

  const newProfile = await Profile.create({
    name: formData.get("name"),
    phone1: formData.get("phone1"),
    email: formData.get("email"),
    businessName: formData.get("businessName"),
    businessAddress: formData.get("businessAddress"),
    // Add business scoping
    business: user.businessId,
    createdBy: user.userId,
    // Add other fields as needed
  });

  return NextResponse.json({ success: true, data: newProfile });
}

export async function getAllProfiles(req: NextRequest, user: UserPayload) {
  await connectDB();
  // Scope profiles to the user's business
  const profiles = await Profile.find({ business: user.businessId });
  return NextResponse.json({ success: true, data: profiles });
}

export async function getProfileById(req: NextRequest, user: UserPayload, id: string) {
  await connectDB();
  const profile = await Profile.findOne({ _id: id, business: user.businessId });
  if (!profile) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: profile });
}

export async function updateProfile(req: NextRequest, user: UserPayload, id: string, formData: FormData) {
  await connectDB();

  const profile = await Profile.findOne({ _id: id, business: user.businessId });
  if (!profile) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  const updated = await Profile.findByIdAndUpdate(
    id,
    {
      $set: Object.fromEntries(formData),
      updatedBy: user.userId,
    },
    { new: true }
  );

  return NextResponse.json({ success: true, data: updated });
}

export async function deleteProfile(req: NextRequest, user: UserPayload, id: string) {
  await connectDB();

  const profile = await Profile.findOne({ _id: id, business: user.businessId });
  if (!profile) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  await Profile.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Deleted" });
}
