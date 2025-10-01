import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Expense {
  _id: string;
  expenseNo: string;
  amount: number;
  category?: string;
  paidTo?: string;
  date: string;
}

interface ExpenseState {
  items: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
  error: null,
};

// Fetch all expenses
export const fetchExpenses = createAsyncThunk("expenses/fetch", async () => {
  const res = await fetch("/api/expenses", { credentials: "include" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch");
  return data.expenses as Expense[];
});

// Create expense
export const createExpense = createAsyncThunk(
  "expenses/create",
  async (expense: Omit<Expense, "_id" | "expenseNo">) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(expense),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create");
    return data.expense as Expense;
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  "expenses/update",
  async (expense: Expense) => {
    const res = await fetch(`/api/expenses?id=${expense._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(expense),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update");
    return data.expense as Expense;
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  "expenses/delete",
  async (id: string) => {
    const res = await fetch(`/api/expenses?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to delete");
    return id;
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.items.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        const index = state.items.findIndex(e => e._id === action.payload._id);
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((e) => e._id !== action.payload);
      });
  },
});

export const selectExpenses = (state: RootState) => state.expenses.items;
export const selectLoading = (state: RootState) => state.expenses.loading;

export default expenseSlice.reducer;
