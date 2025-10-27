"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  format,
  isToday,
  isThisMonth,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AnimatedNumber from "@/components/AnimatedNumber";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";

interface CashEntry {
  _id: string;
  type: "IN" | "OUT";
  amount: number;
  mode: "cash" | "online";
  description?: string;
  createdAt: string;
}

type FilterType = "all" | "today" | "month" | "custom";

export default function CashBookSummaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfRef, setPdfRef] = useState<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "", direction: "asc" });
  const [typeFilter, setTypeFilter] = useState<"all" | "IN" | "OUT">("all");
  const [modeFilter, setModeFilter] = useState<"all" | "cash" | "online">("all");

  // no-op: removed debug logging for filters to keep UI clean

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cashbook", { credentials: "include" });
      const data = await res.json();

      let list: any = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.entries)) list = data.entries;
      else {
        const firstArray = Object.values(data || {}).find((v) => Array.isArray(v));
        if (firstArray) list = firstArray as any;
      }

      if (!Array.isArray(list)) {
        console.warn("Unexpected /api/cashbook response shape:", data);
        list = [];
      }

      // normalize fields: createdAt string, type uppercase, mode lowercase
      setEntries(
        list.map((e: any) => ({
          ...e,
          createdAt: e.createdAt || e.date || new Date().toISOString(),
          type: (e.type || "").toString().toUpperCase(),
          mode: (e.mode || "").toString().toLowerCase(),
        }))
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to fetch cashbook entries");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const bySearch = (e: CashEntry) => {
      if (!q) return true;
      return (
        String(e.description ?? "").toLowerCase().includes(q) ||
        String(e.mode ?? "").toLowerCase().includes(q) ||
        String(e.type ?? "").toLowerCase().includes(q)
      );
    };

    const byType = (e: CashEntry) => {
      if (typeFilter === "all") return true;
      return e.type === typeFilter;
    };

    const byMode = (e: CashEntry) => {
      if (modeFilter === "all") return true;
      return e.mode === modeFilter;
    };

    const byDate = (e: CashEntry) => {
      const d = parseISO(e.createdAt);
      if (filterType === "today") return isToday(d);
      if (filterType === "month") return isThisMonth(d);
      if (filterType === "custom" && customFrom && customTo) {
        const start = startOfDay(parseISO(customFrom));
        const end = endOfDay(parseISO(customTo));
        if (end < start) return false;
        return isWithinInterval(d, { start, end });
      }
      return true;
    };

  let result = entries.filter((e) => bySearch(e) && byDate(e) && byType(e) && byMode(e));

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue: any; let bValue: any;
        switch (sortConfig.key) {
          case "amount":
            aValue = a.amount || 0; bValue = b.amount || 0; break;
          case "date":
            aValue = new Date(a.createdAt).getTime(); bValue = new Date(b.createdAt).getTime(); break;
          case "type":
            aValue = a.type; bValue = b.type; break;
          default:
            return 0;
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [entries, search, filterType, customFrom, customTo, sortConfig, typeFilter, modeFilter]);

  const totalIn = useMemo(() => filtered.filter((e) => e.type === "IN").reduce((s, e) => s + (Number(e.amount) || 0), 0), [filtered]);
  const totalOut = useMemo(() => filtered.filter((e) => e.type === "OUT").reduce((s, e) => s + (Number(e.amount) || 0), 0), [filtered]);
  const net = useMemo(() => totalIn - totalOut, [totalIn, totalOut]);

  const handleSort = (key: string) => setSortConfig((prev) => prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cash Book Report", 14, 12);
    autoTable(doc, {
      startY: 20,
      head: [["S.No","Type","Mode","Date","Description","Amount"]],
      body: filtered.map((e, i) => [i+1, e.type, e.mode, format(parseISO(e.createdAt), "dd/MM/yyyy"), e.description || "-", `₹${(e.amount||0).toFixed(2)}`]),
      foot: [[{ content: "Net", colSpan: 5, styles: { halign: "right" } }, `₹${net.toFixed(2)}`]]
    });
    doc.save(`cashbook_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  const exportExcel = () => {
    const rows = filtered.map((e, i) => ({
      "S.No": i+1,
      Type: e.type,
      Mode: e.mode,
      Date: format(parseISO(e.createdAt), "dd/MM/yyyy"),
      Description: e.description || "",
      "Amount (₹)": Number(e.amount || 0),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "Net", net]], { origin: -1 });
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Cashbook"); XLSX.writeFile(wb, `cashbook_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Cash Book</title>
          <style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}table,th,td{border:1px solid #000}th,td{padding:8px;text-align:left}th{background:#f0f0f0}</style>
        </head>
        <body>${pdfRef.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 flex items-center">
        <div className="flex items-center text-lg font-semibold text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" onClick={() => router.back()} className="h-5 w-5 mr-2 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Cash Book
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Input placeholder="Search description..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" disabled={loading} />
              <Select value={filterType} onValueChange={(v: FilterType) => setFilterType(v)}>
                <SelectTrigger className="w-40" disabled={loading}><SelectValue placeholder="Date Range"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {filterType === "custom" && (
                <>
                  <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} disabled={loading} />
                  <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} disabled={loading} />
                </>
              )}

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-40" disabled={loading}><SelectValue placeholder="Type"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                      All Types
                    </div>
                  </SelectItem>
                  <SelectItem value="IN">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      IN
                    </div>
                  </SelectItem>
                  <SelectItem value="OUT">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      OUT
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as any)}>
                <SelectTrigger className="w-40" disabled={loading}><SelectValue placeholder="Mode"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                      All Modes
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      Online
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2" disabled={loading}>Export Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportExcel}>Download Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}>Print PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="flex items-center gap-2" onClick={printTable} disabled={loading}>Print Cashbook</Button>
            </div>
          </div>

          {/* Report content (wrapped by pdfRef for printing) */}
          <div ref={setPdfRef} className="flex-1 flex flex-col">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">
                Totals:
                <span className="ml-3 text-sm text-gray-600">IN:</span>
                <span className="ml-1 text-xl font-bold text-gray-900">₹ <AnimatedNumber value={totalIn} duration={800} /></span>
                <span className="ml-4 text-sm text-gray-600">OUT:</span>
                <span className="ml-1 text-xl font-bold text-gray-900">₹ <AnimatedNumber value={totalOut} duration={800} /></span>
                <span className="ml-4 text-sm text-gray-600">Net:</span>
                <span className="ml-1 text-xl font-bold text-gray-900">₹ <AnimatedNumber value={net} duration={800} /></span>
              </h2>
            </div>

            <div className="relative flex-1 overflow-auto">
              <div className="w-full">
                <table className="min-w-full w-full">
                  <TableHeader className="bg-gray-100 sticky top-0 z-20">
                    <TableRow>
                      <TableHead className="sticky top-0 bg-gray-100 z-20">S. No.</TableHead>
                      <TableHead onClick={() => handleSort("type")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">
                          Type
                          <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "type" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("mode")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">
                          Mode
                          <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "mode" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("date")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">
                          Date
                          <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                        </div>
                      </TableHead>
                      <TableHead className="sticky top-0 bg-gray-100 z-20">Description</TableHead>
                      <TableHead onClick={() => handleSort("amount")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "amount" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                            Loading cashbook entries...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">No entries found</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((e, idx) => (
                        <TableRow key={e._id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{e.type}</TableCell>
                          <TableCell>{e.mode}</TableCell>
                          <TableCell>{format(parseISO(e.createdAt), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{e.description || "-"}</TableCell>
                          <TableCell>₹{(e.amount || 0).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
