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
import { DeleteIcon, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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

export default function CashbookPage(): JSX.Element {
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
  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!data)
    return <div className="p-6 text-center text-gray-500">No data found</div>;

  const summaryItems = [
    { label: "Total Balance", value: data.totalBalance },
    { label: "Cash In Hand", value: data.cashInHand },
    { label: "Online", value: data.online },
    { label: "Today's Balance", value: data.todaysBalance },
    { label: "Today's Cash In Hand", value: data.todaysCashInHand },
    { label: "Today's Online", value: data.todaysOnline },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cashbook</h1>

        <div className="flex gap-2">
          <button
            onClick={() => openAddModal("IN")}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            + Add IN
          </button>
          <button
            onClick={() => openAddModal("OUT")}
            className="bg-red-600 text-white px-3 py-2 rounded"
          >
            + Add OUT
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="bg-white shadow rounded-lg p-4 text-center border"
          >
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-lg font-semibold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm block mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setPage(1);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="ALL">All</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Mode</label>
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value as any);
              setPage(1);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="ALL">All</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex-1">
          <label className="text-sm block mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search description or mode"
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={exportCSV}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Mode</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No entries found
                </td>
              </tr>
            ) : (
              paginatedEntries.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="p-3">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      e.type === "IN" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {e.type}
                  </td>
                  <td className="p-3">{e.amount}</td>
                  <td className="p-3">{e.mode}</td>
                  <td className="p-3">{e.description}</td>
                  {/* <td className="p-3 space-x-2">
                    <button onClick={() => openEditModal(e)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button onClick={() => openDeleteModal(e)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                  </td> */}
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(e)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(e)}
                          className="text-red-600"
                        >
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
                p === page ? "bg-blue-500 text-white" : ""
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
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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
