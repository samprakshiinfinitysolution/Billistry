"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
import axios from "axios";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
 
// --- Interfaces ---
interface SaleItem {
  _id: string;
  invoiceNo: string;
  selectedParty: { id: string; name: string };
  invoiceDate: string;
  items: {
    name: string;
    productId?: string;
    qty: number;
    price: number;
    _id: string;
  }[];
  totalAmount: number;
  paymentStatus: "unpaid" | "cash" | "online";
}
type FilterType = "all" | "today" | "month" | "custom";

export default function SalesSummaryPage() {
  const router = useRouter();
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfRef, setPdfRef] = useState<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  // make paymentFilter a string so we can support dynamic/unknown payment types (e.g. NETBANKING)
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  function capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  useEffect(() => {
    fetchSales();
  }, []);

  // Fetch sales, customer and items data
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/new_sale", { withCredentials: true });
      setSales(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Sales
  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();

    const bySearch = (s: SaleItem) => {
      if (!q) return true;
      const byName = s.selectedParty?.name?.toLowerCase().includes(q);
      const byInvoice = s.invoiceNo?.toLowerCase().includes(q);
      return !!(byName || byInvoice);
    };

    const byDate = (s: SaleItem) => {
      if (!s.invoiceDate) return false; // Guard against missing date
      const d = parseISO(s.invoiceDate);
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

    const byPayment = (s: SaleItem) => {
      if (paymentFilter === "all") return true;
      return s.paymentStatus === paymentFilter;
    };

    // Step 1: Apply filters
    let result = sales.filter((s) => bySearch(s) && byDate(s) && byPayment(s));

    // Step 2: Apply sorting (only if active)
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "invoiceNo":
            aValue = (a.invoiceNo || "").toString().toLowerCase();
            bValue = (b.invoiceNo || "").toString().toLowerCase();
            break;
          case "customer":
            aValue = (a.selectedParty?.name || "").toString().toLowerCase();
            bValue = (b.selectedParty?.name || "").toString().toLowerCase();
            break;
          case "date":
            aValue = new Date(a.invoiceDate).getTime();
            bValue = new Date(b.invoiceDate).getTime();
            break;
          case "items":
            aValue = a.items.map((i) => i.name).join(", ").toLowerCase();
            bValue = b.items.map((i) => i.name).join(", ").toLowerCase();
            break;
          case "quantity":
            aValue = a.items.reduce((sum, i) => sum + i.qty, 0);
            bValue = b.items.reduce((sum, i) => sum + i.qty, 0);
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
  }, [
    sales,
    search,
    filterType,
    customFrom,
    customTo,
    paymentFilter,
    sortConfig,
  ]);

  // Total invoice amount
  const totalInvoiceAmount = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  //Sort Handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const title = "Sales Summary Report";
    doc.setFontSize(16);
    doc.text(title, 14, 12);

    let subtitle = "All Sales";
    if (date) subtitle = `Date: ${format(date, "dd/MM/yyyy")}`;
    doc.setFontSize(10);
    doc.text(subtitle, 14, 18);

    autoTable(doc, {
      startY: 24,
      head: [
        [
          "S.No",
          "Invoice No",
          "Customer",
          "Date",
          "Items",
          "Quantity",
          "Amount (₹)",
          "Payment Status",
        ],
      ],
  body: filteredSales.map((s, idx) => [
        idx + 1,
        s.invoiceNo,
        s.selectedParty?.name || "",
        format(parseISO(s.invoiceDate), "dd/MM/yyyy"),
  s.items.map((it) => `${it.name || ""} (x${it.qty})`).join(", "),
        s.items.map((it) => `${it.qty} pcs`).join(", "),
        `₹${(s.totalAmount || 0).toFixed(2)}`,
        capitalize(s.paymentStatus || "N/A"),
      ]),
      styles: { fontSize: 9 },
      headStyles: { halign: "left" },
      bodyStyles: { valign: "top" },
      foot: [
        [
          { content: "Grand Total", colSpan: 5, styles: { halign: "right" } },
          { content: "", styles: { halign: "right" } },
          {
            content: `₹${filteredSales
              .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
              .toFixed(2)}`,
            styles: { halign: "right" },
          },
          "",
        ],
      ],
      footStyles: { fontStyle: "bold" },
    });

    doc.save(`sales_summary_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  // Excel Export
  const exportExcel = () => {
    const rows = filteredSales.map((s, idx) => ({
      "S.No": idx + 1,
      "Invoice No": s.invoiceNo,
      Customer: s.selectedParty?.name || "",
      Date: format(parseISO(s.invoiceDate), "dd/MM/yyyy"),
      Items: s.items.map((it) => `${it.name || ""} (x${it.qty})`).join(", "),
      Quantity: s.items.map((it) => `${it.qty} pcs`).join(", "),
      "Amount (₹)": Number(s.totalAmount || 0),
      "Payment Status": capitalize(s.paymentStatus || "N/A"),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const total = filteredSales.reduce(
      (sum, s) => sum + (Number(s.totalAmount) || 0),
      0
    );
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "Grand Total", total, ""]], {
      origin: -1, // This will need to be adjusted for the new column
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Summary");
    XLSX.writeFile(wb, `sales_summary_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Summary</title>
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
          Sales Summary
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          {/* Filter and Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search customer or invoice..."
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
              <Select value={paymentFilter} onValueChange={(v: string) => setPaymentFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  {/**
                   * Build a list of payment options dynamically from `sales` so
                   * unknown types such as "NETBANKING" will appear.
                   */}
                  {
                    /* 'all' option first */
                  }
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                      All Payments
                    </div>
                  </SelectItem>

                  {/** dynamic options derived from data */}
                  {Array.from(new Set(sales.map((s) => (s.paymentStatus || "").toString().trim()).filter(Boolean))).map((opt) => {
                    const key = opt;
                    const lower = opt.toLowerCase();
                    // color mapping for known types, fallback to gray
                    const colorClass = lower === "unpaid" ? "bg-red-500" : lower === "cash" ? "bg-green-500" : lower === "online" ? "bg-blue-500" : "bg-gray-400";
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></span>
                          {capitalize(opt)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
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
                className="flex items-center gap-2"
                onClick={printTable}
              >
                Print Sales Summary
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
            {/* Total Invoice Amount */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">
                Total Sales Amount:{" "}
                <span className="text-xl font-bold text-gray-900">
                  ₹{" "}
                  <AnimatedNumber value={totalInvoiceAmount} duration={1200} />
                </span>
              </h2>
            </div>

            {/* Sales Table */}
            <div className="relative flex-1 overflow-auto">
              <div className="w-full">
                <table className="min-w-full w-full table-fixed text-sm">
                  <TableHeader className="bg-gray-100 sticky top-0 z-20">
                    <TableRow>
                      <TableHead className="sticky top-0 bg-gray-100 z-20">S. No.</TableHead>
                      <TableHead
                        onClick={() => handleSort("invoiceNo")}
                        className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20"
                      >
                        <div className="flex items-center gap-1">
                          Invoice No.
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig.key === "invoiceNo"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>

                      <TableHead
                        onClick={() => handleSort("customer")}
                        className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20"
                      >
                        <div className="flex items-center gap-1">
                          Customer
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig.key === "customer"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>

                      <TableHead
                        onClick={() => handleSort("date")}
                        className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20"
                      >
                        <div className="flex items-center gap-1">
                          Date
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig.key === "date"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>

                      <TableHead className="sticky top-0 bg-gray-100 z-20" style={{ width: '35%' }}>
                        <div className="flex items-center gap-1">Items</div>
                      </TableHead>

                      <TableHead className="sticky top-0 bg-gray-100 z-20" style={{ width: '10%' }}>
                        <div className="flex items-center gap-1">Quantity</div>
                      </TableHead>

                      <TableHead
                        onClick={() => handleSort("amount")}
                        className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20"
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig.key === "amount"
                                ? sortConfig.direction === "asc"
                                  ? "rotate-180 text-blue-600"
                                  : "text-blue-600"
                                : "opacity-70"
                            }`}
                          />
                        </div>
                      </TableHead>

                      <TableHead className="sticky top-0 bg-gray-100 z-20">Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <TableSkeleton rows={6} />
                          </TableCell>
                        </TableRow>
                      ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-4 text-gray-500"
                        >
                          No sales found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale, index) => (
                        <TableRow key={sale._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{sale.invoiceNo}</TableCell>
                          <TableCell>{sale.selectedParty?.name || "N/A"}</TableCell>
                          <TableCell>
                            {format(parseISO(sale.invoiceDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="align-top">
                            {(() => {
                              const items = sale.items || [];
                              if (!items.length) return <span className="text-sm text-gray-600">-</span>;
                              const first = items.slice(0, 2).map((it) => it.name || "");
                              const remaining = items.slice(2);
                              const fullList = items.map((it) => `${it.name || ""} (x${it.qty})`).join("\n");
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="truncate text-sm text-gray-800">{first.join(", ")}{remaining.length ? ", ..." : ""}</div>
                                  {remaining.length > 0 && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="text-xs text-indigo-600 hover:underline">+{remaining.length} more</button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-2">
                                        <div className="text-sm text-gray-700 whitespace-pre-line">
                                          {fullList}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="align-top">
                            {(() => {
                              const items = sale.items || [];
                              if (!items.length) return <span className="text-sm text-gray-600">0</span>;
                              const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
                              if (items.length <= 2) {
                                return <span className="text-sm text-gray-800">{totalQty}</span>;
                              }
                              // when many items, show total and disclosure for per-item qty
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-800">{totalQty}</span>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="text-xs text-gray-500">details</button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2">
                                      <div className="text-sm text-gray-700">
                                        {items.map((it, idx) => (
                                          <div key={idx} className="flex justify-between gap-4">
                                            <div className="truncate">{it.name}</div>
                                            <div className="ml-4 text-gray-600">{it.qty} pcs</div>
                                          </div>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            ₹{sale.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                sale.paymentStatus === "unpaid"
                                  ? "bg-red-100 text-red-600"
                                  : sale.paymentStatus === "cash"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {capitalize(sale.paymentStatus || "N/A")}
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
