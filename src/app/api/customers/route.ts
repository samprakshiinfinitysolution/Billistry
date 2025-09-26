

import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/lib/middleware/auth";
import * as CustomerController from "@/controllers/customerController";
import { asyncHandler } from "@/lib/asyncHandler";

// GET customers (all or single by ID)
export const GET = asyncHandler(async (req: NextRequest) => {
  // await connectDB();
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    // Fetch single customer by ID
    const customer = await CustomerController.getCustomerById(id, user);
    if (!customer)
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ success: true, customer });
  } else {
    // Fetch all customers
    const customers = await CustomerController.getCustomers(user);
    return NextResponse.json({ success: true, customers });
  }
});

// POST: create new customer
export const POST = asyncHandler(async (req: NextRequest) => {
  // await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  if (!body.name)
    return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });

  const customer = await CustomerController.createCustomer(body, user);
  return NextResponse.json({ success: true, customer });
});

// PUT: update customer by ID
export const PUT = asyncHandler(async (req: NextRequest) => {
  // await connectDB();
  const user =await  authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { id, ...updateData } = body;
  if (!id)
    return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });

  const customer = await CustomerController.updateCustomer(id, updateData, user);
  if (!customer)
    return NextResponse.json({ success: false, error: "Customer not found or forbidden" }, { status: 404 });

  return NextResponse.json({ success: true, customer });
});

// DELETE: soft delete customer by ID
export const DELETE = asyncHandler(async (req: NextRequest) => {
  // await connectDB();
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ success: false, error: "Customer ID required" }, { status: 400 });

  const customer = await CustomerController.deleteCustomer(id, user);
  if (!customer)
    return NextResponse.json({ success: false, error: "Customer not found or forbidden" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Customer deleted successfully" });
});
