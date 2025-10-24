import { NextRequest, NextResponse } from "next/server";
import { deleteProfile, getProfileById, updateProfile } from "@/controllers/profileController";

// ✅ GET profile by ID
export async function GET(_: NextRequest, { params }: any) {
  try {
    const profile = await getProfileById(params.id);
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ UPDATE profile by ID
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const formData = await req.formData();
    const updated = await updateProfile(params.id, formData);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: "Profile updated" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ DELETE profile by ID
export async function DELETE(_: NextRequest, { params }: any) {
  try {
    const deleted = await deleteProfile(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Profile deleted" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
