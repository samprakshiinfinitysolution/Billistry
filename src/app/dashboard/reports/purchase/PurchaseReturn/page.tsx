"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, FileText } from "lucide-react";
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
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";

// --- Interfaces ---
interface PurchaseItem {
  _id: string;
  returnInvoiceNo: string;
  selectedParty: { id: string; name: string };
  items: {
    name: string;
    productId?: string;
    qty: number;
    price: number;
    _id: string;
  }[];
  totalAmount: number;
  returnDate: string;
}

type FilterType = "all" | "today" | "month" | "custom";

export default function PurchaseSummaryPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfRef, setPdfRef] = useState<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "", direction: "asc" });

  // Fetch purchases
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/new_purchase_return", { withCredentials: true });
      setPurchases(res.data.data || []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();

    const bySearch = (s: PurchaseItem) => {
      if (!q) return true;
      return (
        s.returnInvoiceNo?.toLowerCase().includes(q) ||
        s.selectedParty?.name?.toLowerCase().includes(q)
      );
    };

    const byDate = (s: PurchaseItem) => {
      if (!s.returnDate) return false;
      const d = parseISO(s.returnDate);
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

    let result = purchases.filter((p) => bySearch(p) && byDate(p));

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue: any = "";
        let bValue: any = "";
        switch (sortConfig.key) {
          case "invoiceNo":
            aValue = a.returnInvoiceNo.toLowerCase();
            bValue = b.returnInvoiceNo.toLowerCase();
            break;
          case "supplier":
            aValue = a.selectedParty?.name?.toLowerCase() || "";
            bValue = b.selectedParty?.name?.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.returnDate).getTime();
            bValue = new Date(b.returnDate).getTime();
            break;
          case "amount":
            aValue = a.totalAmount;
            bValue = b.totalAmount;
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
  }, [purchases, search, filterType, customFrom, customTo, sortConfig]);

  const totalPurchaseAmount = useMemo(() => filteredPurchases.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0), [filteredPurchases]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => (prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Purchase Return Summary Report", 14, 12);
    autoTable(doc, {
      startY: 20,
      head: [["S.No", "Invoice", "Supplier", "Date", "Items", "Quantity", "Amount (₹)"]],
      body: filteredPurchases.map((p, i) => [
        i + 1,
        p.returnInvoiceNo,
        p.selectedParty?.name || "",
        format(parseISO(p.returnDate), "dd/MM/yyyy"),
        p.items.map((it) => it.name).join(", "),
        p.items.map((it) => `${it.qty} pcs`).join(", "),
        `₹${(p.totalAmount || 0).toFixed(2)}`,
      ]),
    });
    doc.save(`purchase_return_summary_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  const exportExcel = () => {
    const rows = filteredPurchases.map((p, i) => ({
      "S.No": i + 1,
      Invoice: p.returnInvoiceNo,
      Supplier: p.selectedParty?.name || "",
      Date: format(parseISO(p.returnDate), "dd/MM/yyyy"),
      Items: p.items.map((it) => it.name).join(", "),
      Quantity: p.items.map((it) => `${it.qty} pcs`).join(", "),
      Amount: Number(p.totalAmount || 0),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Return");
    XLSX.writeFile(wb, `purchase_return_summary_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Return Summary</title>
          <style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}table,th,td{border:1px solid #000}th,td{padding:8px;text-align:left}th{background:#f0f0f0}</style>
        </head>
        <body>
          ${pdfRef?.innerHTML || ""}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 flex items-center">
        <div className="flex items-center text-lg font-semibold text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" onClick={() => router.back()} className="h-5 w-5 mr-2 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Purchase Return Summary
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2 items-center">
              <Input placeholder="Search supplier or invoice..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
              <Select value={filterType} onValueChange={(v: FilterType) => setFilterType(v)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {filterType === "custom" && (
                <>
                  <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                  <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">Export Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportExcel}>Download Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}>Print PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="flex items-center gap-2" onClick={printTable}>Print Purchase Return Summary <FileText className="w-4 h-4" /></Button>
            </div>
          </div>

          <div ref={setPdfRef} className="mb-6">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">Total Purchase Return Amount: <span className="text-xl font-bold text-gray-900">₹ <AnimatedNumber value={totalPurchaseAmount} duration={1200} /></span></h2>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead>S. No.</TableHead>
                    <TableHead onClick={() => handleSort("invoiceNo")} className="cursor-pointer">Invoice No. <ArrowUpDown className={`w-4 h-4 inline-block ${sortConfig.key === "invoiceNo" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} /></TableHead>
                    <TableHead onClick={() => handleSort("supplier")} className="cursor-pointer">Supplier <ArrowUpDown className={`w-4 h-4 inline-block ${sortConfig.key === "supplier" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} /></TableHead>
                    <TableHead onClick={() => handleSort("date")} className="cursor-pointer">Date <ArrowUpDown className={`w-4 h-4 inline-block ${sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} /></TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead onClick={() => handleSort("amount")} className="cursor-pointer">Amount <ArrowUpDown className={`w-4 h-4 inline-block ${sortConfig.key === "amount" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">Loading purchase returns...</TableCell>
                    </TableRow>
                  ) : filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">No purchase returns found</TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((p, i) => (
                      <TableRow key={p._id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{p.returnInvoiceNo}</TableCell>
                        <TableCell>{p.selectedParty?.name ?? "N/A"}</TableCell>
                        <TableCell>{format(parseISO(p.returnDate), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{p.items.map((it) => it.name).join(", ")}</TableCell>
                        <TableCell>{p.items.map((it) => `${it.qty} pcs`).join(", ")}</TableCell>
                        <TableCell>₹{(p.totalAmount || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

