import { NextRequest, NextResponse } from "next/server";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/controllers/expenseController";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await getExpenseById(params.id);
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateExpense(params.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteExpense(params.id);
    return NextResponse.json({ message: "Expense deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
