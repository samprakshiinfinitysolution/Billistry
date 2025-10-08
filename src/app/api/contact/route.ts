import { NextRequest, NextResponse } from "next/server";
import { createContact, getAllContacts } from "@/controllers/contactController";

// POST /api/contact
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const newContact = await createContact({ name, email, subject, message });
    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/contact
export async function GET() {
  try {
    const contacts = await getAllContacts();
    return NextResponse.json(contacts, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
