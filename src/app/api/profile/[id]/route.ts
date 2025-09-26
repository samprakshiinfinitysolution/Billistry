import { deleteProfile, getProfileById, updateProfile } from "@/controllers/profileController";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  return getProfileById(context.params.id);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const formData = await req.formData();
  return updateProfile(context.params.id, formData);
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  return deleteProfile(context.params.id);
}
