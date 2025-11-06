"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Users, UserPlus, Download, Printer } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableSkeleton from '@/components/ui/TableSkeleton';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
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

interface Party {
  _id: string;
  partyName: string;
  mobileNumber: string;
  partyType: "Customer" | "Supplier";
  balance: number;
  createdAt: string;
}

export default function PartiesReportPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [pdfRef, setPdfRef] = useState<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Party; direction: "asc" | "desc" } | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "Customer" | "Supplier">("all");
  const [period, setPeriod] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parties", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch parties");
      const data = await res.json();
      setParties(data.parties || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch party data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedParties = useMemo(() => {
    let result = parties.filter((party) => {
      const searchTerm = search.toLowerCase();
      const partyDate = parseISO(party.createdAt);

      const matchesSearch =
        party.partyName.toLowerCase().includes(searchTerm) ||
        party.mobileNumber.includes(searchTerm);
      const matchesType = typeFilter === "all" || party.partyType === typeFilter;

      let matchesDate = true;
      if (period !== "all") {
        const now = new Date();
        let interval;
        if (period === "today") {
          interval = { start: startOfDay(now), end: endOfDay(now) };
        } else if (period === "this_week") {
          interval = { start: startOfWeek(now), end: endOfWeek(now) };
        } else if (period === "this_month") {
          interval = { start: startOfMonth(now), end: endOfMonth(now) };
        } else if (period === "this_year") {
          interval = { start: startOfYear(now), end: endOfYear(now) };
        }
        if (interval) {
          matchesDate = partyDate >= interval.start && partyDate <= interval.end;
        }
      } else if (startDate && endDate) {
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        matchesDate = partyDate >= start && partyDate <= end;
      } else if (startDate) {
        matchesDate = partyDate >= startOfDay(parseISO(startDate));
      }

      return matchesSearch && matchesType && matchesDate;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [parties, search, typeFilter, sortConfig, period, startDate, endDate]);

  const summary = useMemo(() => {
    return parties.reduce(
      (acc, party) => {
        if (party.partyType === "Customer") {
          acc.totalCustomers += 1;
          if (party.balance > 0) acc.totalReceivable += party.balance;
        } else if (party.partyType === "Supplier") {
          acc.totalSuppliers += 1;
          if (party.balance > 0) acc.totalPayable += party.balance;
        }
        return acc;
      },
      { totalCustomers: 0, totalSuppliers: 0, totalReceivable: 0, totalPayable: 0 }
    );
  }, [parties]);

  const totalIn = useMemo(() => summary.totalReceivable, [summary]);
  const totalOut = useMemo(() => summary.totalPayable, [summary]);
  const net = useMemo(() => totalIn - totalOut, [totalIn, totalOut]);

  const handleSort = (key: keyof Party) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Parties Report", 14, 12);
    autoTable(doc, {
      startY: 20,
      head: [["S.No", "Name", "Mobile", "Type", "Balance (₹)"]],
      body: filteredAndSortedParties.map((p, i) => [
        i + 1,
        p.partyName,
        p.mobileNumber,
        p.partyType,
        p.balance.toFixed(2),
      ]),
    });
    doc.save(`parties_report_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredAndSortedParties.map((p, i) => ({
        "S.No": i + 1,
        Name: p.partyName,
        "Mobile Number": p.mobileNumber,
        Type: p.partyType,
        "Balance (₹)": p.balance,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parties");
    XLSX.writeFile(wb, `parties_report_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Parties Report</title>
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Parties Report
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)} >
                <SelectTrigger className="w-40 cursor-pointer">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
              <Select value={period} onValueChange={(v) => { setPeriod(v); setStartDate(''); setEndDate(''); }} >
                <SelectTrigger className="w-40 cursor-pointer"><SelectValue placeholder="Period" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 cursor-pointer">
                    Export Options
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportExcel}>
                    Download Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}>
                    Print PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
                onClick={printTable}
              >
                Print Parties
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </Button>
            </div>
          </div>

          <div ref={setPdfRef} className="flex-1 flex flex-col overflow-hidden" id="report-content">
            {/* Removed small "Parties Summary" heading per UX request */}

            

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
                <table className="min-w-full w-full table-fixed text-sm">
                  <TableHeader className="bg-gray-100 sticky top-0 z-20">
                    <TableRow>
                      <TableHead className="sticky top-0 bg-gray-100 z-20">S. No.</TableHead>
                      <TableHead onClick={() => handleSort("partyName")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">
                          Name
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig?.key === "partyName"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>

                      <TableHead className="sticky top-0 bg-gray-100 z-20">Mobile</TableHead>

                      <TableHead onClick={() => handleSort("partyType")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20">
                        <div className="flex items-center gap-1">
                          Type
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig?.key === "partyType"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>

                      <TableHead onClick={() => handleSort("balance")} className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          Balance (₹)
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig?.key === "balance"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <TableSkeleton rows={6} />
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedParties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No parties found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedParties.map((party, index) => (
                        <TableRow key={party._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{party.partyName}</TableCell>
                          <TableCell>{party.mobileNumber}</TableCell>
                          <TableCell>{party.partyType}</TableCell>
                          <TableCell className="text-right">
                            <span className={party.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {party.balance.toFixed(2)}
                            </span>
                          </TableCell>
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