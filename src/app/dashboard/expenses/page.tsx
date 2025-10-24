
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2 } from "lucide-react";
import TableSkeleton from '@/components/ui/TableSkeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { FileBarChart } from "lucide-react";


interface Expense {
  _id: string;
  expenseNo: string;
  amount: number;
  category?: string;
  paidTo?: string;
  date: string;
}

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    paidTo: "",
    date: "",
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    partyName: "",
    expenseNo: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      if (
        filters.category &&
        !expense.category?.toLowerCase().includes(filters.category.toLowerCase())
      )
        return false;
      if (
        filters.partyName &&
        !expense.paidTo?.toLowerCase().includes(filters.partyName.toLowerCase())
      )
        return false;
      if (
        filters.expenseNo &&
        !expense.expenseNo.toLowerCase().includes(filters.expenseNo.toLowerCase())
      )
        return false;
      if (fromDate && expenseDate < fromDate) return false;
      if (toDate && expenseDate > toDate) return false;

      return true;
    });
  }, [expenses, filters]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses", { credentials: "include" });
      const data = await res.json();
      if (data.success) setExpenses(data.expenses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ amount: "", category: "", paidTo: "", date: "" });
    setEditingExpense(null);
  };

  const handleSaveExpense = async () => {
    if (!formData.amount.trim()) {
      alert("Amount is required");
      return;
    }

    setLoading(true);
    try {
      const url = editingExpense
        ? `/api/expenses?id=${editingExpense._id}`
        : "/api/expenses";
      const method = editingExpense ? "PATCH" : "POST";

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: formData.date || new Date().toISOString(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        await loadExpenses();
        resetForm();
        setOpen(false);
        alert(`Expense ${editingExpense ? "updated" : "created"} successfully!`);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category || "",
      paidTo: expense.paidTo || "",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((e) => e._id !== id));
        alert("Expense deleted successfully");
      } else {
        alert(data.error || "Failed to delete expense");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <Link href="/dashboard/reports/expense">
      <Button variant="outline" className="flex items-center gap-2">
        <FileBarChart className="h-4 w-4" /> Reports
      </Button>
    </Link>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) resetForm();
          setOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "New Expense"}
            </DialogTitle>
          </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="mb-2">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    min={"0"}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="mb-2">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="mb-2">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Office Supplies"
                />
              </div>
              <div>
                <Label htmlFor="paidTo" className="mb-2">Party Name (Paid To)</Label>
                <Input
                  id="paidTo"
                  value={formData.paidTo}
                  onChange={(e) =>
                    setFormData({ ...formData, paidTo: e.target.value })
                  }
                  placeholder="e.g., Stationery Shop"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveExpense} disabled={loading}>
                {loading
                  ? editingExpense
                    ? "Saving..."
                    : "Saving..."
                  : editingExpense
                  ? "Update"
                  : "Save"}
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-semibold text-gray-800">
            ₹{totalExpenseAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="filter-category" className="mb-2 ">Category</Label>
          <Input
            id="filter-category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="Search Category..."
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="filter-dateFrom" className="mb-2">From</Label>
          <Input
            id="filter-dateFrom"
            name="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label htmlFor="filter-dateTo" className="mb-2">To</Label>
          <Input
            id="filter-dateTo"
            name="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={handleFilterChange}
          />
        </div>
        </div>
        <div>
          <Button onClick={() => setOpen(true)}>+ Create Expense</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-26rem)]">
        {loading ? (
          <div className="p-0">
            <table className="min-w-full divide-y divide-gray-200 text-sm relative">
              <tbody>
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={6} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No expenses found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm relative">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">
                  Expense Number
                </th>
                <th className="px-6 py-3 text-left font-medium">Category</th>
                <th className="px-6 py-3 text-left font-medium">Party Name</th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {filteredExpenses.map((e) => (
                <tr key={e._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {e.expenseNo || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {e.category || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {e.paidTo || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{e.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-gray-900"
                        >
                          <span className="sr-only">Open menu</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(e)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(e._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
    </div>
  );
}
   