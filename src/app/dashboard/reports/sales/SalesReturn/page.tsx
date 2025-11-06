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
  Table,
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
interface SalesReturnItem {
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

export default function SalesSummaryPage() {
  const router = useRouter();
  const [sales, setSales] = useState<SalesReturnItem[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
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
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "unpaid" | "cash" | "online"
  >("all");

  useEffect(() => {
    fetchSales();
  }, []);

  // Fetch sales, customer and items data
  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/new_sale_return", { withCredentials: true });
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

    const bySearch = (s: SalesReturnItem) => {
      if (!q) return true;
      const byName = s.selectedParty?.name?.toLowerCase().includes(q);
      const byInvoice = s.returnInvoiceNo?.toLowerCase().includes(q);
      return !!(byName || byInvoice);
    };

    const byDate = (s: SalesReturnItem) => {
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

    // Step 1: Apply filters
    let result = sales.filter((s) => bySearch(s) && byDate(s));

    // Step 2: Apply sorting (only if active)
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "invoiceNo":
            aValue = a.returnInvoiceNo.toLowerCase();
            bValue = b.returnInvoiceNo.toLowerCase();
            break;
          case "customer":
            aValue = a.selectedParty?.name?.toLowerCase() || "";
            bValue = b.selectedParty?.name?.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.returnDate).getTime();
            bValue = new Date(b.returnDate).getTime();
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
    const title = "Sales Return Summary Report";
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
        ],
      ],
      body: filteredSales.map((s, idx) => [
        idx + 1,
        s.returnInvoiceNo,
        s.selectedParty?.name || "",
        format(parseISO(s.returnDate), "dd/MM/yyyy"),
        s.items.map((it) => `${it.name || ""} (x${it.qty})`).join(", "),
        s.items.map((it) => `${it.qty} pcs`).join(", "),
        `₹${(s.totalAmount || 0).toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { halign: "left" },
      bodyStyles: { valign: "top" },
      foot: [
        [
          { content: "Grand Total", colSpan: 5, styles: { halign: "right" } },
          { content: "", styles: { halign: "right" } },
          {
            content: `₹${filteredSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0)
              .toFixed(2)}`,
            styles: { halign: "right" },
          },
        ],
      ],
      footStyles: { fontStyle: "bold" },
    });

    doc.save(`sales_return_summary_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  // Excel Export
  const exportExcel = () => {
    const rows = filteredSales.map((s, idx) => ({
      "S.No": idx + 1,
      "Invoice No": s.returnInvoiceNo,
      Customer: s.selectedParty?.name || "",
      Date: format(parseISO(s.returnDate), "dd/MM/yyyy"),
      Items: s.items.map((it) => `${it.name || ""} (x${it.qty})`).join(", "),
      Quantity: s.items.map((it) => `${it.qty} pcs`).join(", "),
      "Amount (₹)": Number(s.totalAmount || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const total = filteredSales.reduce(
      (sum, s) => sum + (Number(s.totalAmount) || 0),
      0
    );
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "Grand Total", total, ""]], {
      origin: -1,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Summary");
    XLSX.writeFile(wb, `sales_return_summary_${format(new Date(), "ddMMyyyy")}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Return Summary</title>
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
          Sales Return Summary
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          {/* Filter and Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
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
                <SelectTrigger className="w-40 cursor-pointer">
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
              {/* <Select
                value={paymentFilter}
                onValueChange={(v: "all" | "unpaid" | "cash" | "online") =>
                  setPaymentFilter(v)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                      All Payments
                    </div>
                  </SelectItem>
                  <SelectItem value="unpaid">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      Unpaid
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
              </Select> */}
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
                Print Sales Return Summary
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
                Total Sales Return Amount:{" "}
                <span className="text-xl font-bold text-gray-900">
                  ₹{" "}
                  <AnimatedNumber value={totalInvoiceAmount} duration={1200} />
                </span>
              </h2>
            </div>

            {/* Sales Table */}
            <div className="flex-1 overflow-hidden">
              <Table wrapperClassName="h-full overflow-y-auto overflow-x-hidden" className="w-full table-fixed text-sm h-full">
                <colgroup>
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '7%' }} />
                  <col style={{ width: '13%' }} />
                </colgroup>

                <TableHeader className="bg-gray-100 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="sticky left-0 top-0 bg-gray-100 z-30">S. No.</TableHead>
                    <TableHead onClick={() => handleSort("invoiceNo")} className="cursor-pointer select-none"> 
                      <div className="flex items-center gap-1">Invoice No.
                        <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "invoiceNo" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                      </div>
                    </TableHead>

                    <TableHead onClick={() => handleSort("customer")} className="cursor-pointer select-none">
                      <div className="flex items-center gap-1">Customer
                        <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "customer" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                      </div>
                    </TableHead>

                    <TableHead onClick={() => handleSort("date")} className="cursor-pointer select-none">
                      <div className="flex items-center gap-1">Date
                        <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                      </div>
                    </TableHead>

                    <TableHead>Items</TableHead>

                    <TableHead>Quantity</TableHead>

                    <TableHead onClick={() => handleSort("amount")} className="cursor-pointer select-none">
                      <div className="flex items-center gap-1">Amount
                        <ArrowUpDown className={`w-4 h-4 transition-transform ${sortConfig.key === "amount" ? (sortConfig.direction === "asc" ? "rotate-180 text-blue-600" : "text-blue-600") : "opacity-70"}`} />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0 w-full">
                        <TableSkeleton rows={6} />
                      </TableCell>
                    </TableRow>
                  ) : filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">No sales returns found</TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale, index) => (
                      <TableRow key={sale._id}>
                        <TableCell className="sticky left-0 bg-white z-10">{index + 1}</TableCell>
                        <TableCell>{sale.returnInvoiceNo}</TableCell>
                        <TableCell>{sale.selectedParty?.name || "N/A"}</TableCell>
                        <TableCell>{format(parseISO(sale.returnDate), "dd/MM/yyyy")}</TableCell>
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
                                      <button className="text-xs text-indigo-600 hover:underline cursor-pointer">+{remaining.length} more</button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2">
                                      <div className="text-sm text-gray-700 whitespace-pre-line">{fullList}</div>
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
                            if (items.length <= 2) return <span className="text-sm text-gray-800">{totalQty}</span>;
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-800">{totalQty}</span>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="text-xs text-gray-500 cursor-pointer">details</button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-2">
                                    <div className="text-sm text-gray-700">{items.map((it, idx) => (
                                      <div key={idx} className="flex justify-between gap-4"><div className="truncate">{it.name}</div><div className="ml-4 text-gray-600">{it.qty} pcs</div></div>
                                    ))}</div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="min-w-[120px] text-right whitespace-nowrap">₹{sale.totalAmount.toLocaleString()}</TableCell>
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
