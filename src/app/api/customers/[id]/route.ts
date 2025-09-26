// app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCustomerById, updateCustomer, deleteCustomer } from "@/controllers/customerController";
import { formatError } from "@/lib/errorHandler";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await getCustomerById(params.id);
    if (!customer) return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error: unknown) {
    const message = formatError(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updatedCustomer = await updateCustomer(params.id, req);
    return NextResponse.json(updatedCustomer);
  } catch (error: unknown) {
    const message = formatError(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deletedCustomer = await deleteCustomer(params.id);
    return NextResponse.json(deletedCustomer);
  } catch (error: unknown) {
    const message = formatError(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

