// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from '@/components/ui/table';
// import { Plus, Pencil, Trash2 } from 'lucide-react';
// import axios from 'axios';
// import { format } from 'date-fns';

// interface Expense {
//   _id: string;
//   expenseNo: number;
//   category: string;
//   item?: string;
//   amount: number;
//   date: string;
// }

// export default function ExpensesPage() {
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [open, setOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [form, setForm] = useState({
//     category: '',
//     item: '',
//     amount: '',
//     date: format(new Date(), 'yyyy-MM-dd'),
//   });

//   useEffect(() => {
//     fetchExpenses();
//   }, []);

//   const fetchExpenses = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get('/api/expenses');
//       setExpenses(res.data);
//       setLoading(false);
//     } catch (err: any) {
//       setLoading(false);
//       const msg = err.response?.data?.message || 'Failed to fetch expenses';
//       setError(msg);
//       alert(msg);
//     }
//   };

//   const openAddForm = () => {
//     setEditingId(null);
//     setForm({
//       category: '',
//       item: '',
//       amount: '',
//       date: format(new Date(), 'yyyy-MM-dd'),
//     });
//     setOpen(true);
//   };

//   const openEditForm = (expense: Expense) => {
//     setEditingId(expense._id);
//     setForm({
//       category: expense.category,
//       item: expense.item || '',
//       amount: expense.amount.toString(),
//       date: format(new Date(expense.date), 'yyyy-MM-dd'),
//     });
//     setOpen(true);
//   };

//   const handleSave = async () => {
//     if (!form.category.trim()) {
//       alert('Category is required');
//       return;
//     }
//     if (!form.amount || isNaN(Number(form.amount))) {
//       alert('Valid amount is required');
//       return;
//     }
//     try {
//       setLoading(true);
//       if (editingId) {
//         // Update
//         await axios.put(`/api/expenses/${editingId}`, {
//           category: form.category,
//           item: form.item,
//           amount: Number(form.amount),
//           date: form.date,
//         });
//         alert('Expense updated successfully');
//       } else {
//         // Create
//         await axios.post('/api/expenses', {
//           category: form.category,
//           item: form.item,
//           amount: Number(form.amount),
//           date: form.date,
//         });
//         alert('Expense created successfully');
//       }
//       setOpen(false);
//       fetchExpenses();
//     } catch (err: any) {
//       const msg = err.response?.data?.message || 'Error saving expense';
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this expense?')) return;
//     try {
//       await axios.delete(`/api/expenses/${id}`);
//       alert('Expense deleted successfully');
//       fetchExpenses();
//     } catch (err: any) {
//       alert(err.response?.data?.message || 'Failed to delete expense');
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Expenses</h1>
//         <Button onClick={openAddForm}>
//           <Plus className="w-4 h-4 mr-2" /> Add Expense
//         </Button>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Expense No</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Item</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {expenses.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-4">
//                     No expenses found.
//                   </TableCell>
//                 </TableRow>
//               )}
//               {expenses.map(expense => (
//                 <TableRow key={expense._id}>
//                   <TableCell>{expense.expenseNo}</TableCell>
//                   <TableCell>{expense.category}</TableCell>
//                   <TableCell>{expense.item || '-'}</TableCell>
//                   <TableCell>₹{expense.amount.toFixed(2)}</TableCell>
//                   <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
//                   <TableCell className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => openEditForm(expense)}
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDelete(expense._id)}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Add/Edit Dialog */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-md w-full">
//           <DialogHeader>
//             <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div>
//               <label className="block font-semibold mb-1">Category *</label>
//               <Input
//                 value={form.category}
//                 onChange={e => setForm({ ...form, category: e.target.value })}
//                 placeholder="Category"
//               />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Item</label>
//               <Input
//                 value={form.item}
//                 onChange={e => setForm({ ...form, item: e.target.value })}
//                 placeholder="Item (optional)"
//               />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Amount *</label>
//               <Input
//                 type="number"
//                 value={form.amount}
//                 onChange={e => setForm({ ...form, amount: e.target.value })}
//                 placeholder="Amount"
//                 min={0}
//               />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Date</label>
//               <Input
//                 type="date"
//                 value={form.date}
//                 onChange={e => setForm({ ...form, date: e.target.value })}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave} disabled={loading || !form.category || !form.amount}>
//               {loading ? 'Saving...' : 'Save'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Expense {
  _id: string;
  expenseNo: string;
  title: string;
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
    title: "",
    amount: "",
    category: "",
    paidTo: "",
    date: "",
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const res = await fetch("/api/expenses", { credentials: "include" });
      const data = await res.json();
      if (data.success) setExpenses(data.expenses);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", amount: "", category: "", paidTo: "", date: "" });
    setEditingExpense(null);
  };

  const handleSaveExpense = async () => {
    if (!formData.title.trim() || !formData.amount.trim()) {
      alert("Title and Amount are required");
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
        // safer: reload expenses to always get the latest expenseNo
        await loadExpenses();
        resetForm();
        setOpen(false);
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
      title: expense.title,
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
      } else {
        alert(data.error || "Failed to delete expense");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Expense" : "New Expense"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Paid To</Label>
                <Input
                  value={formData.paidTo}
                  onChange={(e) =>
                    setFormData({ ...formData, paidTo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveExpense} disabled={loading}>
                {loading
                  ? editingExpense
                    ? "Updating..."
                    : "Saving..."
                  : editingExpense
                  ? "Update"
                  : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        {expenses.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No expenses found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Expense No</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Paid To</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((e) => (
                <tr key={e._id}>
                  <td className="px-4 py-2">
                    {e.expenseNo || "—"} {/* fallback if backend fails */}
                  </td>
                  <td className="px-4 py-2">{e.title}</td>
                  <td className="px-4 py-2">{e.amount}</td>
                  <td className="px-4 py-2">{e.category || "-"}</td>
                  <td className="px-4 py-2">{e.paidTo || "-"}</td>
                  <td className="px-4 py-2">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(e)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(e._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
