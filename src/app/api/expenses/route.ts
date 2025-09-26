// import { NextRequest, NextResponse } from "next/server";
// import { getAllExpenses, createExpense } from "@/controllers/expenseController";

// export async function GET() {
//   try {
//     const expenses = await getAllExpenses();
//     return NextResponse.json(expenses);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const expense = await createExpense(body);
//     return NextResponse.json(expense, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ Import the separated CRUD functions
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "@/controllers/expenseController";

// CREATE
export const POST = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const expense = await createExpense(body, user);

  return NextResponse.json(
    { success: true, expense },
    { status: 201 }
  );
});

// READ ALL or ONE
export const GET = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const expense = await getExpenseById(id, user);
    if (!expense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, expense });
  }

  const expenses = await getExpenses(user);
  return NextResponse.json({ success: true, expenses });
});

// UPDATE
export const PATCH = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Expense ID is required" },
      { status: 400 }
    );
  }

  const updateData = await req.json();
  const expense = await updateExpense(id, updateData, user);
  if (!expense) {
    return NextResponse.json(
      { success: false, error: "Expense not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, expense });
});

// DELETE (soft delete)
export const DELETE = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Expense ID is required" },
      { status: 400 }
    );
  }

  const expense = await deleteExpense(id, user);
  if (!expense) {
    return NextResponse.json(
      { success: false, error: "Expense not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, expense });
});
