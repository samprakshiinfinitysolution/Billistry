"use client";

import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Search, ChevronDown, FileBarChart } from "lucide-react";
import TableSkeleton from '@/components/ui/TableSkeleton';
import toast from "react-hot-toast";
import Link from "next/link";
 
type CashbookSummary = {
  totalBalance: number;
  cashInHand: number;
  online: number;
  todaysBalance: number;
  todaysCashInHand: number;
  todaysOnline: number;
};

type Entry = {
  _id: string;
  type: "IN" | "OUT";
  amount: number;
  mode: string; // backend might use "cash"|"online" -> we'll normalize in UI
  description: string;
  createdAt: string;
};

type CashbookResponse = CashbookSummary & { entries: Entry[] };

type EntryForm = {
  type: "IN" | "OUT";
  amount: string; // keep as string for stable controlled input
  mode: "Cash" | "Online";
  description: string;
};

export default function CashbookPage(): React.JSX.Element {
  const [data, setData] = useState<CashbookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & pagination
  const [typeFilter, setTypeFilter] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [modeFilter, setModeFilter] = useState<"ALL" | "Cash" | "Online">(
    "ALL"
  );
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [entryForm, setEntryForm] = useState<EntryForm>({
    type: "IN",
    amount: "",
    mode: "Cash",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const formatDisplayCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data
  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/cashbook");
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const json: CashbookResponse = await res.json();

      // normalize mode to Title case so UI is consistent ("cash" -> "Cash")
      json.entries = json.entries.map((e) => ({
        ...e,
        mode:
          (e.mode || "").toString().toLowerCase() === "online"
            ? "Online"
            : "Cash",
      }));
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load cashbook data.");
    } finally {
      setLoading(false);
    }
  }

  // Filtering (case-insensitive)
  const filteredEntries = useMemo(() => {
    if (!data) return [];
    return data.entries.filter((e) => {
      if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
      if (modeFilter !== "ALL" && e.mode !== modeFilter) return false;
      if (
        search &&
        !`${e.description} ${e.mode}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (dateFrom && new Date(e.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(e.createdAt) > new Date(dateTo + "T23:59:59"))
        return false;
      return true;
    });
  }, [data, typeFilter, modeFilter, search, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / perPage));
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // CSV / PDF export (uses filteredEntries)
  function exportCSV() {
    if (!filteredEntries.length) return;
    const header = ["Date", "Type", "Amount", "Mode", "Description"];
    const rows = filteredEntries.map((e) => [
      new Date(e.createdAt).toLocaleString(),
      e.type,
      e.amount,
      e.mode,
      e.description,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cashbook.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // function exportPDF() {
  //   if (!filteredEntries.length) return;
  //   const doc = new jsPDF();
  //   doc.setFontSize(16);
  //   doc.text("📒 Cashbook Report", 14, 15);
  //   if (dateFrom || dateTo) {
  //     doc.setFontSize(10);
  //     doc.text(`Date range: ${dateFrom || "Any"} → ${dateTo || "Any"}`, 14, 22);
  //   }
  //   const tableData = filteredEntries.map((e) => [
  //     new Date(e.createdAt).toLocaleString(),
  //     e.type,
  //     e.amount,
  //     e.mode,
  //     e.description,
  //   ]);
  //   (doc as any).autoTable({
  //     head: [["Date", "Type", "Amount", "Mode", "Description"]],
  //     body: tableData,
  //     startY: dateFrom || dateTo ? 28 : 20,
  //   });
  //   doc.save("cashbook.pdf");
  // }
  function exportPDF() {
    if (!filteredEntries.length) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("📒 Cashbook Report", 14, 15);

    let startY = 20;
    if (dateFrom || dateTo) {
      doc.setFontSize(10);
      doc.text(`Date range: ${dateFrom || "Any"} → ${dateTo || "Any"}`, 14, 22);
      startY = 28;
    }

    const tableData = filteredEntries.map((e) => [
      new Date(e.createdAt).toLocaleString(),
      e.type,
      e.amount.toString(),
      e.mode,
      e.description || "",
    ]);

    autoTable(doc, {
      head: [["Date", "Type", "Amount", "Mode", "Description"]],
      body: tableData,
      startY,
    });

    doc.save("cashbook.pdf");
  }
  // Helpers to open modals and set form
  function openAddModal(defaultType: "IN" | "OUT" = "IN") {
    setEntryForm({
      type: defaultType,
      amount: "",
      mode: "Cash",
      description: "",
    });
    setSelectedEntry(null);
    setShowAddModal(true);
  }

  function openEditModal(entry: Entry) {
    setSelectedEntry(entry);
    setEntryForm({
      type: entry.type,
      amount: String(entry.amount),
      mode: entry.mode === "Online" ? "Online" : "Cash",
      description: entry.description ?? "",
    });
    setShowEditModal(true);
  }

  function openDeleteModal(entry: Entry) {
    setSelectedEntry(entry);
    setShowDeleteModal(true);
  }

  // Add
  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(entryForm.amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        type: entryForm.type,
        amount: amountNum,
        // backend sample used lowercase; send lowercase to be robust
        mode: entryForm.mode.toLowerCase(),
        description: entryForm.description,
      };
      const res = await fetch("/api/cashbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Add failed: ${res.status} ${text}`);
      }
      // refresh data from server to get computed totals & createdAt
      await fetchData();
      setShowAddModal(false);
      toast.success("Cashbook entry added successfully");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Add failed");
    } finally {
      setSubmitting(false);
    }
  }

  // Edit
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEntry) return toast.error("No entry selected");
    const amountNum = Number(entryForm.amount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        type: entryForm.type,
        amount: amountNum,
        mode: entryForm.mode.toLowerCase(),
        description: entryForm.description,
      };
      const res = await fetch(`/api/cashbook/${selectedEntry._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed: ${res.status} ${text}`);
      }
      await fetchData();
      setShowEditModal(false);
      setSelectedEntry(null);
      toast.success("Cashbook entry updated successfully");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDeleteConfirm() {
    if (!selectedEntry) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cashbook/${selectedEntry._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }
      await fetchData();
      setShowDeleteModal(false);
      setSelectedEntry(null);
      toast.success("Cashbook entry deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  }

  // UI states
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const summaryItems = [
    { label: "Total Balance", value: data?.totalBalance ?? 0 },
    { label: "Cash In Hand", value: data?.cashInHand ?? 0 },
    { label: "Online", value: data?.online ?? 0 },
    { label: "Today's Balance", value: data?.todaysBalance ?? 0 },
    { label: "Today's Cash In Hand", value: data?.todaysCashInHand ?? 0 },
    { label: "Today's Online", value: data?.todaysOnline ?? 0 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Cashbook</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/reports/cashbook-report">
            <Button variant="outline" className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" /> Reports
            </Button>
          </Link>
          <button
            onClick={() => openAddModal("IN")}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            + Add IN
          </button>
          <button
            onClick={() => openAddModal("OUT")}
            className="bg-black text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black/40"
          >
            + Add OUT
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-6 mb-6 mt-4">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-sm p-4 text-center"
          >
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">₹ {formatDisplayCurrency(item.value)}</div>
          </div>
        ))}
      </div>

  {/* Filters */}
        <div className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm block mb-1">Type</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700">
                <span className="inline-flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${typeFilter === 'ALL' ? 'bg-gray-400' : typeFilter === 'IN' ? 'bg-indigo-600' : 'bg-black'}`}></span>
                  <span className="capitalize">{typeFilter.toLowerCase() === 'all' ? 'All' : typeFilter}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setTypeFilter('ALL'); setPage(1); }}>
                <span className="w-2 h-2 rounded-full mr-2 inline-block bg-gray-400" /> All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('IN'); setPage(1); }}>
                <span className="w-2 h-2 rounded-full mr-2 inline-block bg-indigo-600" /> IN
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setTypeFilter('OUT'); setPage(1); }}>
                <span className="w-2 h-2 rounded-full mr-2 inline-block bg-black" /> OUT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="text-sm block mb-1">Mode</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700">
                <span className="inline-flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${modeFilter === 'ALL' ? 'bg-gray-400' : modeFilter === 'Cash' ? 'bg-emerald-500' : 'bg-indigo-600'}`}></span>
                  <span className="capitalize">{modeFilter.toLowerCase() === 'all' ? 'All' : modeFilter}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setModeFilter('ALL'); setPage(1); }}>
                <span className="w-2 h-2 rounded-full mr-2 inline-block bg-gray-400" /> All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setModeFilter('Cash'); setPage(1); }}>
                <span className="w-2 h-2 rounded-full mr-2 inline-block bg-emerald-500" /> Cash
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setModeFilter('Online'); setPage(1); }}>
                <span className="w-2 h-2 rounded-full mr-2 inline-block bg-indigo-600" /> Online
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="text-sm block mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700"
          />
        </div>

        <div className="flex-1">
          <label className="text-sm block mb-1">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search description or mode"
              className="border rounded-md px-3 py-1.5 text-sm w-full bg-white dark:bg-gray-700 pl-10"
            />
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={exportCSV}
            className="bg-white border px-3 py-1.5 rounded-md text-sm hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-white border px-3 py-1.5 rounded-md text-sm hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white sticky top-0 z-10 border-b">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <TableSkeleton rows={5} />
                </td>
              </tr>
            ) : paginatedEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No entries found</td>
              </tr>
            ) : (
              paginatedEntries.map((e) => (
                <tr key={e._id} className="border-b hover:bg-gray-50 cursor-pointer text-sm">
                  <td className="px-3 py-2 align-top">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className={`px-3 py-2 font-semibold ${e.type === "IN" ? 'text-indigo-600' : 'text-slate-800 dark:text-slate-200'}`}>{e.type}</td>
                  <td className="px-3 py-2">₹{formatDisplayCurrency(e.amount)}</td>
                  <td className="px-3 py-2">{e.mode}</td>
                  <td className="px-3 py-2">{e.description}</td>
                  <td className="px-3 py-2 text-right relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(e)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteModal(e)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`border px-3 py-1 rounded ${
                p === page ? "bg-indigo-600 text-white" : ""
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Modal (shared) */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {showAddModal ? "Add Entry" : "Edit Entry"}
            </h2>
            <form
              onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit}
              className="space-y-3"
            >
              <select
                value={entryForm.type}
                onChange={(e) =>
                  setEntryForm({
                    ...entryForm,
                    type: e.target.value as "IN" | "OUT",
                  })
                }
                className="border rounded w-full px-3 py-2"
              >
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>

              <input
                type="number"
                value={entryForm.amount}
                onChange={(e) =>
                  setEntryForm({ ...entryForm, amount: e.target.value })
                }
                className="border rounded w-full px-3 py-2"
                placeholder="Amount"
                required
              />

              <select
                value={entryForm.mode}
                onChange={(e) =>
                  setEntryForm({
                    ...entryForm,
                    mode: e.target.value as "Cash" | "Online",
                  })
                }
                className="border rounded w-full px-3 py-2"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>

              <input
                type="text"
                value={entryForm.description}
                onChange={(e) =>
                  setEntryForm({ ...entryForm, description: e.target.value })
                }
                className="border rounded w-full px-3 py-2"
                placeholder="Description"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
            <p className="mb-4">Are you sure you want to delete this entry?</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
