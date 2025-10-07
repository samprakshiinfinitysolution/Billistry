import { NextRequest, NextResponse } from "next/server";
import {
  getContactById,
  updateContact,
  deleteContact,
} from "@/controllers/contactController";

// GET /api/contact/:id
export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const contact = await getContactById(id);

    if (!contact) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: contact }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/contact/:id
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();
    const updatedContact = await updateContact(id, body);

    if (!updatedContact) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: updatedContact, message: "Contact updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/contact/:id
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const deleted = await deleteContact(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
