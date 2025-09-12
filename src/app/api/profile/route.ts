import { NextRequest, NextResponse } from "next/server";
import { createProfile, getAllProfiles } from "@/controllers/profileController";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  return createProfile(req, formData);
}

export async function GET() {
  return getAllProfiles();
}
