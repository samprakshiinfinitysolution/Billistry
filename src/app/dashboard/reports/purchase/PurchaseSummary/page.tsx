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
  billTo: { name: string };
  items: {
    item: { _id: string; name: string; unit?: string };
    quantity: number;
    rate: number;
    total: number;
  }[];
  invoiceAmount: number;
  paymentStatus: "unpaid" | "cash" | "online";
  date: string;
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
      setPurchases(data.purchases || []);
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
          p.billTo?.name.toLowerCase().includes(query);

        const matchPayment =
          paymentFilter === "all" || p.paymentStatus === paymentFilter;

        const purchaseDate = parseISO(p.date);
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
            aValue = a.billTo?.name.toLowerCase() || "";
            bValue = b.billTo?.name.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case "amount":
            aValue = a.invoiceAmount;
            bValue = b.invoiceAmount;
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
        (acc, p) => acc + (Number(p.invoiceAmount) || 0),
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
        p.billTo?.name ?? "N/A",
        format(parseISO(p.date), "dd/MM/yyyy"),
        p.items.map((i) => i.item.name).join(", "),
        p.items.map((i) => `${i.quantity} ${i.item?.unit ?? "pcs"}`).join(", "),
        `₹${p.invoiceAmount.toFixed(2)}`,
        p.paymentStatus.toUpperCase(),
      ]),
    });

    doc.save(`purchase_summary_${format(new Date(), "ddMMyyyy")}.pdf`);
  };

  const exportExcel = () => {
    const rows = filteredPurchases.map((p, i) => ({
      "S.No": i + 1,
      Invoice: p.invoiceNo,
      Supplier: p.billTo?.name ?? "N/A",
      Date: format(parseISO(p.date), "dd/MM/yyyy"),
      Items: p.items.map((i) => i.item.name).join(", "),
      Quantity: p.items
        .map((i) => `${i.quantity} ${i.item?.unit ?? "pcs"}`)
        .join(", "),
      Amount: p.invoiceAmount,
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
    <div className="min-h-screen bg-gray-50">
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

      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Filter & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2 items-center">
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

          {/* Total */}
          <div ref={setPdfRef} className="mb-6">
            {/* Total Invoice Amount */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">
                Total Purchase Amount:{" "}
                <span className="text-xl font-bold text-gray-900">
                  ₹{" "}
                  <AnimatedNumber value={totalPurchaseAmount} duration={1200} />
                </span>
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead>S. No.</TableHead>
                    <TableHead
                      onClick={() => handleSort("invoiceNo")}
                      className="cursor-pointer"
                    >
                      Invoice No. <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("supplier")}
                      className="cursor-pointer"
                    >
                      Supplier <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("date")}
                      className="cursor-pointer"
                    >
                      Date <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead
                      onClick={() => handleSort("amount")}
                      className="cursor-pointer"
                    >
                      Amount <ArrowUpDown className="inline w-4 h-4" />
                    </TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        Loading purchases...
                      </TableCell>
                    </TableRow>
                  ) : filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        No purchases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((p, i) => (
                      <TableRow key={p._id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{p.invoiceNo}</TableCell>
                        <TableCell>{p.billTo?.name ?? "N/A"}</TableCell>
                        <TableCell>
                          {format(parseISO(p.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {p.items.map((i) => i.item.name).join(", ")}
                        </TableCell>
                        <TableCell>
                          {p.items
                            .map(
                              (i) => `${i.quantity} ${i.item?.unit ?? "pcs"}`
                            )
                            .join(", ")}
                        </TableCell>
                        <TableCell>₹{p.invoiceAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              p.paymentStatus === "unpaid"
                                ? "bg-red-100 text-red-600"
                                : p.paymentStatus === "cash"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {p.paymentStatus.toUpperCase()}
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
      </main>
    </div>
  );
}
