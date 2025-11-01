"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronDown } from "lucide-react";
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
import TableSkeleton from '@/components/ui/TableSkeleton';
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

interface ExpenseItem {
  _id: string;
  expenseNo?: number | string;
  expenseNoFormatted?: string;
  amount: number;
  category?: string;
  paidTo?: string;
  date: string;
  title?: string;
}

type FilterType = "all" | "today" | "month" | "custom";

export default function ExpensesSummaryPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfRef, setPdfRef] = useState<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "", direction: "asc" });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", { credentials: "include" });
      const data = await res.json();

      // Normalize response into an array to avoid runtime errors when API returns
      // { data: [...] } or { expenses: [...] } or an array directly.
      let list: any = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.expenses)) {
        list = data.expenses;
      } else if (Array.isArray(data?.result)) {
        list = data.result;
      } else {
        // If the response is an object with numeric keys or wrapped differently, try to extract arrays
        // Fallback: attempt to find the first array-valued property
        const firstArray = Object.values(data || {}).find((v) => Array.isArray(v));
        if (firstArray) list = firstArray as any;
      }

      if (!Array.isArray(list)) {
        console.warn("Unexpected /api/expenses response shape, expected array. Response:", data);
        list = [];
      }

      setExpenses(list);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();

    const bySearch = (e: ExpenseItem) => {
      if (!q) return true;
      const no = String(e.expenseNoFormatted ?? e.expenseNo ?? "").toLowerCase();
      const party = String(e.paidTo ?? "").toLowerCase();
      const cat = String(e.category ?? "").toLowerCase();
      const title = String(e.title ?? "").toLowerCase();
      return no.includes(q) || party.includes(q) || cat.includes(q) || title.includes(q);
    };

    const byDate = (e: ExpenseItem) => {
      if (!e.date) return false;
      const d = parseISO(e.date);
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

    let result = expenses.filter((e) => bySearch(e) && byDate(e));

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue: any; let bValue: any;
        switch (sortConfig.key) {
          case "expenseNo":
            aValue = String(a.expenseNoFormatted ?? a.expenseNo ?? "").toLowerCase();
            bValue = String(b.expenseNoFormatted ?? b.expenseNo ?? "").toLowerCase();
            break;
          case "party":
            aValue = String(a.paidTo ?? "").toLowerCase();
            bValue = String(b.paidTo ?? "").toLowerCase();
            break;
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case "category":
            aValue = String(a.category ?? "").toLowerCase();
            bValue = String(b.category ?? "").toLowerCase();
            break;
          case "amount":
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [expenses, search, filterType, customFrom, customTo, sortConfig]);

  const totalAmount = useMemo(() => filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [filteredExpenses]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Expenses Summary", 14, 12);
    doc.setFontSize(10);
    const rows = filteredExpenses.map((e, idx) => [
      idx + 1,
      e.expenseNoFormatted ?? String(e.expenseNo ?? ""),
      e.paidTo ?? "",
      format(parseISO(e.date), "dd/MM/yyyy"),
      e.category ?? "",
      `₹${(e.amount || 0).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["S.No","Expense No","Party","Date","Category","Amount"]],
      body: rows,
      foot: [[{ content: "Grand Total", colSpan: 5, styles: { halign: "right" } }, `₹${totalAmount.toFixed(2)}`]],
    });

    doc.save(`expenses_summary_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  const exportExcel = () => {
    const rows = filteredExpenses.map((e, idx) => ({
      "S.No": idx + 1,
      "Expense No": e.expenseNoFormatted ?? String(e.expenseNo ?? ""),
      Party: e.paidTo ?? "",
      Date: format(parseISO(e.date), "dd/MM/yyyy"),
      Category: e.category ?? "",
      "Amount (₹)": Number(e.amount || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const total = totalAmount;
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "Grand Total", total]], { origin: -1 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses Summary");
    XLSX.writeFile(wb, `expenses_summary_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Expenses Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            table, th, td { border: 1px solid #000; }
            th, td { padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          ${pdfRef.innerHTML}
        </body>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => router.back()}
            className="h-5 w-5 mr-2 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Expenses Summary
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search expense no, party or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
                disabled={loading}
              />

              <Select value={filterType} onValueChange={(v: FilterType) => setFilterType(v)}>
                <SelectTrigger className="w-40 cursor-pointer" disabled={loading}>
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
                  <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} disabled={loading} />
                  <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} disabled={loading} />
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2" disabled={loading}>Export Options <ChevronDown className="w-4 h-4 text-gray-600 ml-1" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportExcel}>Download Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}>Print PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="flex items-center gap-2" onClick={printTable} disabled={loading}>Print Expenses Summary</Button>
            </div>
          </div>

          <div ref={setPdfRef} className="flex-1 flex flex-col overflow-hidden" id="report-content">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">Total Expenses Amount: <span className="text-xl font-bold text-gray-900">₹ <AnimatedNumber value={totalAmount} duration={1200} /></span></h2>
            </div>

            <div className="relative flex-1 overflow-auto">
              <div className="w-full">
                <table className="min-w-full w-full text-sm">
                  <TableHeader className="bg-gray-100 sticky top-0 z-20">
                    <TableRow>
                      <TableHead className="sticky top-0 bg-gray-100 z-20">S. No.</TableHead>
                      <TableHead onClick={() => handleSort("expenseNo")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">Expense No. <ArrowUpDown className="w-4 h-4 opacity-70" /></div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("party")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">Party <ArrowUpDown className="w-4 h-4 opacity-70" /></div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("date")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">Date <ArrowUpDown className="w-4 h-4 opacity-70" /></div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("category")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">Category <ArrowUpDown className="w-4 h-4 opacity-70" /></div>
                      </TableHead>
                      <TableHead onClick={() => handleSort("amount")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">Amount <ArrowUpDown className="w-4 h-4 opacity-70" /></div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <TableSkeleton rows={6} />
                        </TableCell>
                      </TableRow>
                    ) : filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">No expenses found</TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((e, idx) => (
                        <TableRow key={e._id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{e.expenseNoFormatted ?? String(e.expenseNo ?? "")}</TableCell>
                          <TableCell>{e.paidTo || "-"}</TableCell>
                          <TableCell>{format(parseISO(e.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{e.category || "-"}</TableCell>
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