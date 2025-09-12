"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Download, Plus, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

type InvoiceItem = {
  name: string;
  quantity: number;
  rate: number;
  cgst?: number;
  sgst?: number;
};

type InvoiceType = {
  id: string;
  customerName: string;
  customerMobile: string;
  date: string;
  status: "Paid" | "Pending" | "Cancelled";
  items: InvoiceItem[];
  notes?: string;
};

export default function EnhancedInvoicePage() {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const emptyInvoice = {
    id: "",
    customerName: "",
    customerMobile: "",
    date: new Date().toISOString().split("T")[0],
    status: "Pending" as "Paid" | "Pending" | "Cancelled",
    items: [{ name: "", quantity: 1, rate: 0, cgst: 0, sgst: 0 }],
    notes: "",
  };

  const [form, setForm] = useState<InvoiceType>(emptyInvoice);

  // --- Filtered invoices ---
  const filtered = useMemo(
    () =>
      invoices.filter(
        (inv) =>
          inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
          inv.id.toLowerCase().includes(search.toLowerCase())
      ),
    [invoices, search]
  );

  // --- Handlers ---
  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, rate: 0, cgst: 0, sgst: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index: number, key: keyof InvoiceItem, value: any) => {
    const newItems = [...form.items];
    newItems[index][key] = value;
    setForm({ ...form, items: newItems });
  };

  const calcTotals = useMemo(() => {
    let subtotal = 0,
      totalCGST = 0,
      totalSGST = 0;
    form.items.forEach((it) => {
      const itemTotal = it.rate * it.quantity;
      subtotal += itemTotal;
      totalCGST += (itemTotal * (it.cgst || 0)) / 100;
      totalSGST += (itemTotal * (it.sgst || 0)) / 100;
    });
    return { subtotal, totalCGST, totalSGST, grandTotal: subtotal + totalCGST + totalSGST };
  }, [form.items]);

  const handleCreateInvoice = () => {
    // Validation
    if (!form.id || !form.customerName || !form.customerMobile) {
      toast.error("Please fill all required fields.");
      return;
    }
    setInvoices((prev) => [form, ...prev]);
    toast.success("Invoice created successfully!");
    setForm(emptyInvoice);
    setShowModal(false);
  };

  const exportPDF = (singleInvoice?: InvoiceType) => {
    const doc = new jsPDF();
    const data = singleInvoice ? [singleInvoice] : filtered;

    data.forEach((inv, idx) => {
      doc.setFontSize(16);
      doc.text("Company Name / Logo", 14, 10);
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${inv.id}`, 14, 20);
      doc.text(`Date: ${inv.date}`, 14, 26);
      doc.text(`Customer: ${inv.customerName}`, 14, 32);
      doc.text(`Mobile: ${inv.customerMobile}`, 14, 38);

      const body = inv.items.map((it) => [
        it.name,
        it.quantity,
        it.rate.toFixed(2),
        `${it.cgst || 0}%`,
        `${it.sgst || 0}%`,
        (it.rate * it.quantity).toFixed(2),
      ]);

      autoTable(doc, {
        startY: 46,
        head: [["Item", "Qty", "Rate", "CGST", "SGST", "Amount"]],
        body,
      });

      const yPos = (doc as any).lastAutoTable.finalY + 6;
      doc.text(`Subtotal: ₹${calcTotals.subtotal.toFixed(2)}`, 14, yPos);
      doc.text(`CGST: ₹${calcTotals.totalCGST.toFixed(2)}`, 14, yPos + 6);
      doc.text(`SGST: ₹${calcTotals.totalSGST.toFixed(2)}`, 14, yPos + 12);
      doc.setFontSize(14);
      doc.text(`Grand Total: ₹${calcTotals.grandTotal.toFixed(2)}`, 14, yPos + 20);

      if (inv.notes) {
        doc.setFontSize(12);
        doc.text(`Notes: ${inv.notes}`, 14, yPos + 30);
      }

      doc.text("Authorized Sign: ____________", 140, yPos + 40);

      if (!singleInvoice && idx < data.length - 1) doc.addPage();
    });

    doc.save(singleInvoice ? `${singleInvoice.id}.pdf` : "invoices.pdf");
  };

  const exportExcel = () => {
    const rows = filtered.map((inv) => ({
      ID: inv.id,
      Customer: inv.customerName,
      Mobile: inv.customerMobile,
      Date: inv.date,
      Status: inv.status,
      Subtotal: calcTotals.subtotal.toFixed(2),
      CGST: calcTotals.totalCGST.toFixed(2),
      SGST: calcTotals.totalSGST.toFixed(2),
      GrandTotal: calcTotals.grandTotal.toFixed(2),
      Notes: inv.notes || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "invoices.xlsx");
  };

  return (
    <section className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-pink-500" /> Invoices
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportPDF()}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg"
          >
            <Download size={18} /> Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg"
          >
            <Download size={18} /> Export Excel
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg shadow"
          >
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 relative max-w-md">
        <input
          type="text"
          placeholder="Search by customer or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border rounded-xl overflow-hidden shadow text-sm md:text-base">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="px-6 py-3">Invoice ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Mobile</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Grand Total</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const subtotal = inv.items.reduce((sum, it) => sum + it.rate * it.quantity, 0);
              const totalCGST = inv.items.reduce((sum, it) => sum + (it.rate * it.quantity * (it.cgst || 0)) / 100, 0);
              const totalSGST = inv.items.reduce((sum, it) => sum + (it.rate * it.quantity * (it.sgst || 0)) / 100, 0);
              const grandTotal = subtotal + totalCGST + totalSGST;
              return (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{inv.id}</td>
                  <td className="px-6 py-4">{inv.customerName}</td>
                  <td className="px-6 py-4">{inv.customerMobile}</td>
                  <td className="px-6 py-4">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs md:text-sm rounded-full font-semibold ${
                        inv.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : inv.status === "Pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{grandTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => exportPDF(inv)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-4">Add New Invoice</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Invoice ID"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Customer Mobile"
                value={form.customerMobile}
                onChange={(e) => setForm({ ...form, customerMobile: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full border p-2 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Items */}
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                      className="border p-2 rounded w-1/3"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="border p-2 rounded w-1/6"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      min={0}
                      onChange={(e) => handleItemChange(idx, "rate", Number(e.target.value))}
                      className="border p-2 rounded w-1/6"
                    />
                    <input
                      type="number"
                      placeholder="CGST %"
                      value={item.cgst}
                      min={0}
                      onChange={(e) => handleItemChange(idx, "cgst", Number(e.target.value))}
                      className="border p-2 rounded w-1/6"
                    />
                    <input
                      type="number"
                      placeholder="SGST %"
                      value={item.sgst}
                      min={0}
                      onChange={(e) => handleItemChange(idx, "sgst", Number(e.target.value))}
                      className="border p-2 rounded w-1/6"
                    />
                    {form.items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 font-bold px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddItem}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  + Add Item
                </button>
              </div>

              <textarea
                placeholder="Optional Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border p-2 rounded"
              />

              {/* Totals */}
              <div className="mt-2">
                <p>Subtotal: ₹{calcTotals.subtotal.toFixed(2)}</p>
                <p>CGST: ₹{calcTotals.totalCGST.toFixed(2)}</p>
                <p>SGST: ₹{calcTotals.totalSGST.toFixed(2)}</p>
                <p className="font-semibold">Grand Total: ₹{calcTotals.grandTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                className="px-4 py-2 bg-pink-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
