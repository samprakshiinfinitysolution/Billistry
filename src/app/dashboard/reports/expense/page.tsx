











"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";


interface Expense {
  _id: string;
  expenseNo?: number | string;
  expenseNoFormatted?: string;
  amount: number;
  category?: string;
  paidTo?: string;
  date: string;
}

interface ExpenseReportResponse {
  summary: {
    totalExpenses: number;
    totalAmount: number;
  };
  expenses: Expense[];
}

export default function ExpenseReportPage() {
    const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ totalExpenses: number; totalAmount: number }>({
    totalExpenses: 0,
    totalAmount: 0,
  });

  const [searchValue, setSearchValue] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "thisWeek" | "thisMonth" | "custom">("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Load from API
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("dateType", dateFilter);

      if (dateFilter === "custom") {
        if (customFrom) params.append("startDate", customFrom);
        if (customTo) params.append("endDate", customTo);
      }

      const res = await fetch(`/api/reports/bills/expense?${params.toString()}`, {
        credentials: "include",
      });
      const data: ExpenseReportResponse = await res.json();

      setExpenses(data?.expenses ?? []);
      setSummary(data?.summary ?? { totalExpenses: 0, totalAmount: 0 });
    } catch (err) {
      console.error("Failed to load expenses:", err);
      setExpenses([]);
      setSummary({ totalExpenses: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [dateFilter, customFrom, customTo]);

  // Safe combined search (coerce values to string first)
  const filteredExpenses = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return expenses;

    return expenses.filter((e) => {
      // Prefer formatted number if available
      const no = String(e.expenseNoFormatted ?? e.expenseNo ?? "").toLowerCase();
      const party = String(e.paidTo ?? "").toLowerCase();
      const cat = String(e.category ?? "").toLowerCase();

      return no.includes(q) || party.includes(q) || cat.includes(q);
    });
  }, [expenses, searchValue]);

  // totals computed from filtered list
  const filteredTotalAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [filteredExpenses]
  );

  // CSV export
const handleDownloadExcel = () => {
  if (!filteredExpenses.length) return;

  const headers = ["Date", "Expense No", "Party", "Category", "Amount"];
  const rows = filteredExpenses.map((e) => [
    new Date(e.date).toLocaleDateString(),
    e.expenseNoFormatted ?? String(e.expenseNo ?? ""),
    e.paidTo ?? "",
    e.category ?? "",
    e.amount.toFixed(2),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`) // escape quotes
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `expense_report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};





const handleDownloadPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("Expense Report", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  // Table columns
  const tableColumn = ["Date", "Expense No", "Party", "Category", "Amount"];

  // Table rows
  const tableRows = filteredExpenses.map((e) => [
    new Date(e.date).toLocaleDateString(),
    e.expenseNoFormatted ?? String(e.expenseNo ?? ""),
    e.paidTo || "-",
    e.category || "-",
    `${e.amount.toFixed(2)}`,
  ]);

  // Generate table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: "grid",
    headStyles: { fillColor:  "#0B0240" },
    columnStyles: {
      4: { halign: "center" }, // right align amount
    },
  });

  doc.save("expense_report.pdf");
};


  return (
    <div className="flex flex-col h-full bg-gray-100 font-inter">
        <header className="flex items-center justify-between px-10 py-4 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-4">
          <ArrowLeft
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={() => router.back()}
          />
          <h1 className="text-xl font-semibold text-gray-800">Expense Report</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={handleDownloadExcel}>Download Excel</Button>
            <Button onClick={handleDownloadPDF}>Download PDF</Button>
          
        </div>
      </header>
      


      
   
       
        



        {/* Summary */}
<div className="flex flex-col justify-between m-2 gap-1.5">
        <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between text-gray-700">
          <p>Total Expenses: {filteredExpenses.length} {/* shows filtered count */}</p>
          <p className="font-semibold">Total Amount: ₹{filteredTotalAmount.toFixed(2)}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search by Expense No, Party, Category..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>


          <div className="flex-1 min-w-[200px]">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div className="flex-1 min-w-[180px]">
                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            </>
          )}
        </div>
    </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-500">Loading...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No expenses found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Expense No</th>
                  <th className="px-6 py-3 text-left font-medium">Party</th>
                  <th className="px-6 py-3 text-left font-medium">Category</th>
                  <th className="px-6 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
                {filteredExpenses.map((e) => (
                  <tr key={e._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.expenseNoFormatted ?? String(e.expenseNo ?? "")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.paidTo || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.category || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">₹{(e.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
  


    
    
  );
 
  
}
