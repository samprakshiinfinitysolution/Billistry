"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import axios from "axios";
import {
  format,
  isToday,
  isThisMonth,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Make sure you have @types/jspdf-autotable installed for type definitions
import * as XLSX from "xlsx";
import useAuthGuard from "@/hooks/useAuthGuard";

interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Item {
  _id: string;
  name: string;
  purchasePrice: number;
  gstRate?: number;
}

interface PurchaseItemForm {
  item: string;
  quantity: number;
  rate: number;
  gstApplied: boolean;
}

interface PurchaseLine {
  item: Item;
  quantity: number;
  rate: number;
  total: number;
}

interface Purchase {
  _id: string;
  invoiceNo: string;
  billTo: Supplier;
  date: string;
  items: PurchaseLine[];
  paymentStatus: "unpaid" | "cash" | "online";
  invoiceAmount: number;
}

type FilterType = "all" | "today" | "month" | "custom";

export default function PurchasePage() {
  // --- Auth & Permissions ---
  const { user } = useAuthGuard(); // 👈
  // --- Data ---
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // --- UI / state ---
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(
    null
  );

  // Form
  const [form, setForm] = useState({
    billTo: "",
    date: format(new Date(), "yyyy-MM-dd"),
    items: [] as PurchaseItemForm[],
    paymentStatus: "unpaid" as "unpaid" | "cash" | "online",
  });

  // Search & filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // --- Fetch ---
  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchItems();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get("/api/purchase", { withCredentials: true });
      setPurchases(res.data.data || []); // ✅ set only the array
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch purchases");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("/api/suppliers", { withCredentials: true });
      // setSuppliers(res.data);
      setSuppliers(
        Array.isArray(res.data) ? res.data : res.data.suppliers || []
      );
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/product", { credentials: "include" });
      const data = await res.json();

      if (res.ok && data.success) {
        setItems(data.products as Item[]); // ✅ now matches your state
      } else {
        console.error(data.error || "Failed to load items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // --- Helpers ---
  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item: "", quantity: 1, rate: 0, gstApplied: false },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const handleItemChange = <K extends keyof PurchaseItemForm>(
    index: number,
    key: K,
    value: PurchaseItemForm[K]
  ) => {
    const updated = [...form.items];
    updated[index][key] = value;

    if (key === "item") {
      const selected = items.find((i) => i._id === value);
      if (selected) {
        updated[index].rate = selected.purchasePrice ?? 0;
        updated[index].gstApplied = !!selected.gstRate;
      }
    }

    if (key === "quantity")
      updated[index].quantity = Math.max(1, Number(value) || 1);
    if (key === "rate") updated[index].rate = Math.max(0, Number(value) || 0);

    setForm({ ...form, items: updated });
  };

  const calcTotal = useMemo(() => {
    return form.items.reduce((acc, it) => {
      const itemData = items.find((i) => i._id === it.item);
      if (!itemData) return acc;
      let amount = it.quantity * it.rate;
      if (it.gstApplied && itemData.gstRate)
        amount += (amount * itemData.gstRate) / 100;
      return acc + amount;
    }, 0);
  }, [form.items, items]);

  const openAddForm = () => {
    setEditingPurchaseId(null);
    setForm({
      billTo: "",
      date: format(new Date(), "yyyy-MM-dd"),
      items: [],
      paymentStatus: "unpaid",
    });
    setOpen(true);
  };

  const openEditForm = (p: Purchase) => {
    setEditingPurchaseId(p._id);
    setForm({
      billTo: p.billTo?._id || "",
      date: format(new Date(p.date), "yyyy-MM-dd"),
      items: p.items.map((it) => ({
        item: it.item._id,
        quantity: it.quantity,
        rate: it.rate,
        gstApplied: !!it.item.gstRate,
      })),
      paymentStatus: p.paymentStatus,
    });
    setOpen(true);
  };

  // --- CRUD ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...form, invoiceAmount: calcTotal };
      if (editingPurchaseId) {
        await axios.put(`/api/purchase/${editingPurchaseId}`, payload);
        alert("Purchase updated successfully");
      } else {
        await axios.post("/api/purchase", payload);
        alert("Purchase created successfully");
      }
      setOpen(false);
      fetchPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving purchase");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this purchase?")) return;
    try {
      await axios.delete(`/api/purchase/${id}`);
      alert("Purchase Deleted successfully");
      fetchPurchases();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  // --- Filter & Search ---
  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases.filter((p) => {
      const matchSearch =
        !q ||
        p.billTo?.name.toLowerCase().includes(q) ||
        p.invoiceNo.toLowerCase().includes(q);
      const d = parseISO(p.date);
      let matchDate = true;
      if (filterType === "today") matchDate = isToday(d);
      if (filterType === "month") matchDate = isThisMonth(d);
      if (filterType === "custom" && customFrom && customTo) {
        const start = startOfDay(parseISO(customFrom));
        const end = endOfDay(parseISO(customTo));
        matchDate = isWithinInterval(d, { start, end });
      }
      return matchSearch && matchDate;
    });
  }, [purchases, search, filterType, customFrom, customTo]);

  // --- Export PDF/Excel (like Sales page) ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Purchase Report", 14, 12);
    autoTable(doc, {
      startY: 18,
      head: [["Invoice", "Supplier", "Date", "Items", "Amount", "Status"]],
      body: filteredPurchases.map((p) => [
        p.invoiceNo,
        p.billTo?.name || "",
        format(new Date(p.date), "dd/MM/yyyy"),
        p.items.map((i) => `${i.item?.name} (x${i.quantity})`).join(", "),
        `₹${p.invoiceAmount.toFixed(2)}`,
        p.paymentStatus,
      ]),
      styles: { fontSize: 9 },
    });
    doc.save("purchase_report.pdf");
  };

  const exportExcel = () => {
    const rows = filteredPurchases.map((p) => ({
      Invoice: p.invoiceNo,
      Supplier: p.billTo?.name,
      Date: format(new Date(p.date), "dd/MM/yyyy"),
      Items: p.items.map((i) => `${i.item?.name} (x${i.quantity})`).join(", "),
      Amount: p.invoiceAmount,
      Status: p.paymentStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    XLSX.writeFile(wb, "purchases.xlsx");
  };

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Purchases</h1>
        <Button onClick={openAddForm}>
          <Plus className="w-4 h-4 mr-2" /> Add Purchase
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Input
          placeholder="Search invoice or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select
          value={filterType}
          onValueChange={(v: FilterType) => setFilterType(v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {filterType === "custom" && (
          <>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}
        <Button variant="outline" onClick={exportPDF}>
          <Download className="w-4 h-4 mr-2" /> PDF
        </Button>
        <Button variant="outline" onClick={exportExcel}>
          <Download className="w-4 h-4 mr-2" /> Excel
        </Button>
      </div>

      <div className="w-full border rounded overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Invoice
                </TableHead>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Supplier
                </TableHead>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Date
                </TableHead>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Items
                </TableHead>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Payment
                </TableHead>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Amount
                </TableHead>
                <TableHead className="sticky top-0 bg-white px-4 py-2">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No purchases found.
                  </TableCell>
                </TableRow>
              )}
              {filteredPurchases.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="px-4 py-2">{p.invoiceNo}</TableCell>
                  <TableCell className="px-4 py-2">{p.billTo?.name}</TableCell>
                  <TableCell className="px-4 py-2">
                    {format(new Date(p.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {p.items
                      .map((i) => `${i.item?.name} (x${i.quantity})`)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="px-4 py-2">{p.paymentStatus}</TableCell>
                  <TableCell className="px-4 py-2">₹{p.invoiceAmount.toFixed(2)}</TableCell>
                  {/* <TableCell className="px-4 py-2">
                    {user?.permissions?.viewAmounts
                      ? `₹${p.invoiceAmount.toFixed(2)}`
                      : "####"}
                  </TableCell> */}

                  <TableCell className="flex gap-2 px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditForm(p)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(p._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>
              {editingPurchaseId ? "Edit Purchase" : "Add Purchase"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Select
              value={form.billTo}
              onValueChange={(v) => setForm({ ...form, billTo: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name} ({s.phone || s.email || "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            {form.items.map((it, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-center">
                <Select
                  value={it.item}
                  onValueChange={(v) => handleItemChange(idx, "item", v)}
                >
                  <SelectTrigger className="w-1/3 min-w-[140px]">
                    <SelectValue placeholder="Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i._id} value={i._id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={it.quantity}
                  min={1}
                  className="w-20"
                  onChange={(e) =>
                    handleItemChange(idx, "quantity", Number(e.target.value))
                  }
                />
                <Input
                  type="number"
                  value={it.rate}
                  min={0}
                  className="w-24"
                  onChange={(e) =>
                    handleItemChange(idx, "rate", Number(e.target.value))
                  }
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={it.gstApplied}
                    onChange={(e) =>
                      handleItemChange(idx, "gstApplied", e.target.checked)
                    }
                  />{" "}
                  GST
                </label>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveItem(idx)}
                >
                  🗑
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddItem}>
              + Add Item
            </Button>

            <Select
              value={form.paymentStatus}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  paymentStatus: v as "unpaid" | "cash" | "online",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-right font-semibold">
              Total: ₹{calcTotal.toFixed(2)}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !form.billTo || form.items.length === 0}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
