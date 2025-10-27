import Profile from "@/models/profile";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function createProfile(req: NextRequest, formData: FormData) {
  await connectDB();

  const newProfile = await Profile.create({
    name: formData.get("name"),
    phone1: formData.get("phone1"),
    phone2: formData.get("phone2") || "",
    gstNumber: formData.get("gstNumber") || "",
    email: formData.get("email"),
    image: formData.get("image"),
    businessName: formData.get("businessName"),
    businessAddress: formData.get("businessAddress"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    businessType: formData.get("businessType"),
    businessCategory: formData.get("businessCategory"),
    aboutBusiness: formData.get("aboutBusiness"),
    sealSignature: formData.get("sealSignature"),
  });

  return NextResponse.json({ success: true, data: newProfile });
}

export async function getAllProfiles() {
  await connectDB();
  const profiles = await Profile.find();
  return NextResponse.json({ success: true, data: profiles });
}

export async function getProfileById(id: string) {
  await connectDB();
  const profile = await Profile.findById(id);
  return NextResponse.json({ success: true, data: profile });
}

export async function updateProfile(id: string, formData: FormData) {
  await connectDB();

  const updated = await Profile.findByIdAndUpdate(
    id,
    {
      $set: Object.fromEntries(formData),
    },
    { new: true }
  );

  return NextResponse.json({ success: true, data: updated });
}

export async function deleteProfile(id: string) {
  await connectDB();
  await Profile.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Deleted" });
}
