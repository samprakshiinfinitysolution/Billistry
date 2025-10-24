"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Download, FileText } from "lucide-react";
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
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";

// --- Interfaces ---
interface PurchaseItem {
  _id: string;
  invoiceNo: string;
  selectedParty: { id: string; name: string };
  items: {
    name: string;
    productId?: string;
    qty: number;
    price: number;
    _id: string;
  }[];
  totalAmount: number;
  paymentStatus: "unpaid" | "cash" | "online";
  invoiceDate: string;
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
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "unpaid" | "cash" | "online"
  >("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "", direction: "asc" });

  // --- Fetch Purchases ---
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/new_purchase", {
        withCredentials: true,
      });
      setPurchases(data.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // --- Filter + Search + Sort ---
  const filteredPurchases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return purchases
      .filter((p) => {
        const matchSearch =
          !query ||
          p.invoiceNo.toLowerCase().includes(query) ||
          p.selectedParty?.name.toLowerCase().includes(query);

        const matchPayment =
          paymentFilter === "all" || p.paymentStatus === paymentFilter;

        const purchaseDate = parseISO(p.invoiceDate);
        let matchDate = true;
        if (filterType === "today") matchDate = isToday(purchaseDate);
        else if (filterType === "month") matchDate = isThisMonth(purchaseDate);
        else if (filterType === "custom" && customFrom && customTo) {
          const start = startOfDay(parseISO(customFrom));
          const end = endOfDay(parseISO(customTo));
          matchDate = isWithinInterval(purchaseDate, { start, end });
        }

        return matchSearch && matchPayment && matchDate;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aValue: any, bValue: any;

        switch (sortConfig.key) {
          case "invoiceNo":
            aValue = a.invoiceNo.toLowerCase();
            bValue = b.invoiceNo.toLowerCase();
            break;
          case "supplier":
            aValue = a.selectedParty?.name.toLowerCase() || "";
            bValue = b.selectedParty?.name.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.invoiceDate).getTime();
            bValue = new Date(b.invoiceDate).getTime();
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
  }, [
    purchases,
    search,
    filterType,
    customFrom,
    customTo,
    paymentFilter,
    sortConfig,
  ]);

  const totalPurchaseAmount = useMemo(
    () =>
      filteredPurchases.reduce(
        (acc, p) => acc + (Number(p.totalAmount) || 0),
        0
      ),
    [filteredPurchases]
  );

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // --- Export PDF ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Purchase Summary Report", 14, 12);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "S.No",
          "Invoice",
          "Supplier",
          "Date",
          "Items",
          "Quantity",
          "Amount",
          "Payment",
        ],
      ],
      body: filteredPurchases.map((p, i) => [
        i + 1,
        p.invoiceNo,
        p.selectedParty?.name ?? "N/A",
        format(parseISO(p.invoiceDate), "dd/MM/yyyy"),
        p.items.map((i) => i.name).join(", "),
        p.items.map((i) => `${i.qty} pcs`).join(", "),
        `₹${p.totalAmount.toFixed(2)}`,
        p.paymentStatus.toUpperCase(),
      ]),
    });

    doc.save(`purchase_summary_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  const exportExcel = () => {
    const rows = filteredPurchases.map((p, i) => ({
      "S.No": i + 1,
      Invoice: p.invoiceNo,
      Supplier: p.selectedParty?.name ?? "N/A",
      Date: format(parseISO(p.invoiceDate), "dd/MM/yyyy"),
      Items: p.items.map((i) => i.name).join(", "),
      Quantity: p.items.map((i) => `${i.qty} pcs`).join(", "),
      Amount: p.totalAmount,
      Payment: p.paymentStatus.toUpperCase(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Summary");
    XLSX.writeFile(
      wb,
      `purchase_summary_${format(new Date(), "ddMMyyyy")}.xlsx`
    );
  };

  // --- Print Table ---
  const printTable = () => {
    if (!pdfRef) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Summary</title>
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
          Purchase Summary
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          {/* Filter & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2 items-center">
              {/* ...existing filter inputs... */}
              <Input
                placeholder="Search supplier or invoice..."
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

              <Select
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
                Print Summary <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div ref={setPdfRef} className="flex-1 flex flex-col overflow-hidden" id="report-content">
            {/* Total */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">
                Total Purchase Amount: {" "}
                <span className="text-xl font-bold text-gray-900">
                  ₹ {" "}
                  <AnimatedNumber value={totalPurchaseAmount} duration={1200} />
                </span>
              </h2>
            </div>

            {/* Table */}
            <div className="relative flex-1 overflow-auto">
              <div className="w-full">
                <table className="min-w-full w-full text-sm">
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
                        onClick={() => handleSort("supplier")}
                        className="cursor-pointer select-none sticky top-0 bg-gray-100 z-20"
                      >
                        <div className="flex items-center gap-1">
                          Supplier
                          <ArrowUpDown
                            className={`w-4 h-4 transition-transform ${
                              sortConfig.key === "supplier"
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

                      <TableHead className="sticky top-0 bg-gray-100 z-20">Items</TableHead>
                      <TableHead className="sticky top-0 bg-gray-100 z-20">Quantity</TableHead>

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
                    ) : filteredPurchases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">No purchases found</TableCell>
                      </TableRow>
                    ) : (
                      filteredPurchases.map((p, i) => (
                        <TableRow key={p._id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{p.invoiceNo}</TableCell>
                          <TableCell>{p.selectedParty?.name ?? "N/A"}</TableCell>
                          <TableCell>{format(parseISO(p.invoiceDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell className="align-top">
                            {(() => {
                              const items = p.items || [];
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
                              const items = p.items || [];
                              if (!items.length) return <span className="text-sm text-gray-600">0</span>;
                              const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
                              if (items.length <= 2) return <span className="text-sm text-gray-800">{totalQty}</span>;
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-800">{totalQty}</span>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="text-xs text-gray-500">details</button>
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
                          <TableCell>₹{p.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              p.paymentStatus === "unpaid"
                                ? "bg-red-100 text-red-600"
                                : p.paymentStatus === "cash"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {p.paymentStatus.toUpperCase()}
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
