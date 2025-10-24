"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Users, UserPlus, FileDown, Printer } from "lucide-react";
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
  const tableRef = useRef<HTMLDivElement | null>(null);

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
    if (!tableRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Parties Report</title><style>body{font-family:sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px} th{background-color:#f2f2f2}</style></head><body>${tableRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Parties Report</h1>
        <p className="text-gray-500">View, filter, and export your party data.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500"><h3 className="text-gray-500">Total Customers</h3><p className="text-2xl font-semibold"><AnimatedNumber value={summary.totalCustomers} /></p></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500"><h3 className="text-gray-500">Total Suppliers</h3><p className="text-2xl font-semibold"><AnimatedNumber value={summary.totalSuppliers} /></p></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500"><h3 className="text-gray-500">Total Receivable</h3><p className="text-2xl font-semibold">₹<AnimatedNumber value={summary.totalReceivable} /></p></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500"><h3 className="text-gray-500">Total Payable</h3><p className="text-2xl font-semibold">₹<AnimatedNumber value={summary.totalPayable} /></p></div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter by Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(v) => { setPeriod(v); setStartDate(''); setEndDate(''); }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter by Period" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportPDF}>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel}>Export as Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={printTable}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod('all'); }} className="w-40" />
          <span className="text-gray-500">to</span>
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod('all'); }} className="w-40" />
        </div>

        <div ref={tableRef} className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("partyName")} className="cursor-pointer">Name <ArrowUpDown className="inline h-4 w-4" /></TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead onClick={() => handleSort("partyType")} className="cursor-pointer">Type <ArrowUpDown className="inline h-4 w-4" /></TableHead>
                <TableHead onClick={() => handleSort("balance")} className="cursor-pointer text-right">Balance (₹) <ArrowUpDown className="inline h-4 w-4" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredAndSortedParties.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No parties found.</TableCell></TableRow>
              ) : (
                filteredAndSortedParties.map((party) => (
                  <TableRow key={party._id}>
                    <TableCell className="font-medium">{party.partyName}</TableCell>
                    <TableCell>{party.mobileNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        party.partyType === 'Customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {party.partyType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={party.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {party.balance.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}