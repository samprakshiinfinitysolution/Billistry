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
import axios from "axios";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";

interface Customer {
  _id: string;
  name: string;
}

interface Item {
  _id: string;
  name: string;
  purchasePrice: number;
}

interface SaleLine {
  item: Item;
  quantity: number;
  rate: number;
  total: number;
}

interface Sale {
  _id: string;
  invoiceNo: string;
  billTo: Customer | null;
  date: string;
  items: SaleLine[];
  paymentStatus: "unpaid" | "cash" | "online";
  invoiceAmount: number;
}
type FilterType = "all" | "today" | "month" | "custom";

export default function SalesSummaryPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfRef, setPdfRef] = useState<HTMLDivElement | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);

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
    fetchCustomers();
    fetchItems();
  }, []);

  // Fetch sales, customer and items data
  const fetchSales = async () => {
    try {
      const res = await axios.get("/api/new_sale", { withCredentials: true });
      setSales(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch sales");
    }
  };
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/customers", { withCredentials: true });
      setCustomers(
        Array.isArray(res.data) ? res.data : res.data.customers || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/product", { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.products as Item[]);
      } else {
        console.error(data.error || "Failed to load items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // Filter & Sort Sales
  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();

    const bySearch = (s: Sale) => {
      if (!q) return true;
      const byName = s.billTo?.name?.toLowerCase().includes(q);
      const byInvoice = s.invoiceNo?.toLowerCase().includes(q);
      return !!(byName || byInvoice);
    };

    const byDate = (s: Sale) => {
      const d =
        typeof s.date === "string" ? parseISO(s.date) : new Date(s.date);
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

    const byPayment = (s: Sale) => {
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
            aValue = a.invoiceNo.toLowerCase();
            bValue = b.invoiceNo.toLowerCase();
            break;
          case "customer":
            aValue = a.billTo?.name?.toLowerCase() || "";
            bValue = b.billTo?.name?.toLowerCase() || "";
            break;
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case "items":
            aValue = a.items
              .map((i) => i.item.name)
              .join(", ")
              .toLowerCase();
            bValue = b.items
              .map((i) => i.item.name)
              .join(", ")
              .toLowerCase();
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
    return filteredSales.reduce((acc, s) => acc + s.invoiceAmount, 0);
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
          "Amount (₹)",
          "Payment Status",
        ],
      ],
      body: filteredSales.map((s, idx) => [
        idx + 1,
        s.invoiceNo,
        s.billTo?.name || "",
        format(parseISO(s.date), "dd/MM/yyyy"),
        s.items
          .map((it) => `${it.item?.name || ""} (x${it.quantity})`)
          .join(", "),
        `₹${(s.invoiceAmount || 0).toFixed(2)}`,
        s.paymentStatus.toUpperCase(),
      ]),
      styles: { fontSize: 9 },
      headStyles: { halign: "left" },
      bodyStyles: { valign: "top" },
      foot: [
        [
          { content: "Grand Total", colSpan: 5, styles: { halign: "right" } },
          {
            content: `₹${filteredSales
              .reduce((sum, s) => sum + (Number(s.invoiceAmount) || 0), 0)
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
      Customer: s.billTo?.name || "",
      Date: format(parseISO(s.date), "dd/MM/yyyy"),
      Items: s.items
        .map((it) => `${it.item?.name || ""} (x${it.quantity})`)
        .join(", "),
      "Amount (₹)": Number(s.invoiceAmount || 0),
      "Payment Status": s.paymentStatus.toUpperCase(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const total = filteredSales.reduce(
      (sum, s) => sum + (Number(s.invoiceAmount) || 0),
      0
    );
    XLSX.utils.sheet_add_aoa(ws, [["", "", "", "", "Grand Total", total, ""]], {
      origin: -1,
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
          Sales Summary
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
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

          <div ref={setPdfRef}>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead>S. No.</TableHead>
                    <TableHead
                      onClick={() => handleSort("invoiceNo")}
                      className="cursor-pointer select-none"
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
                      className="cursor-pointer select-none"
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
                      className="cursor-pointer select-none"
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

                    <TableHead
                      onClick={() => handleSort("items")}
                      className="cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        Items
                        <ArrowUpDown
                          className={`w-4 h-4 transition-transform ${
                            sortConfig.key === "items"
                              ? sortConfig.direction === "asc"
                                ? "rotate-180 text-blue-600"
                                : "text-blue-600"
                              : "opacity-70"
                          }`}
                        />
                      </div>
                    </TableHead>

                    <TableHead
                      onClick={() => handleSort("amount")}
                      className="cursor-pointer select-none"
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

                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        Loading sales data...
                      </TableCell>
                    </TableRow>
                  ) : filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                        <TableCell>{sale.billTo?.name || "N/A"}</TableCell>
                        <TableCell>
                          {format(new Date(sale.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {sale.items.map((i) => i.item.name).join(", ")}
                        </TableCell>
                        <TableCell>
                          ₹{sale.invoiceAmount.toLocaleString()}
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
                            {sale.paymentStatus.toUpperCase()}
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
