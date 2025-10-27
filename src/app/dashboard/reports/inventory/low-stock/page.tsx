"use client";

import { calculateSubtotal } from "@/utils/productCalculations";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui setup
import { Product } from "@/types/product";
import AnimatedNumber from "@/components/AnimatedNumber";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // For date picker
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils"; // For conditional classnames
import React, { useMemo, useState, useEffect } from "react";
// ReportLayout was temporarily added; restore original layout

export default function StockSummaryPage() {
  const [date, setDate] = React.useState(new Date());
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [taxFilter, setTaxFilter] = useState<"all" | "with" | "without">("all");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<
    "tillToday" | "today" | "week" | "month" | "custom"
  >("tillToday");
  const router = useRouter();
  // Initialize sortConfig with default ascending for 'name'
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    setDate(new Date());
  }, []);
  //Fetching Products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/product", { credentials: "include" });
        const data = await res.json();
        if (data.success) setProducts(data.products ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);
  // All low stock products (for table and total)
  const allLowStockProducts = useMemo(() => {
    return products.filter(
      (p) => Number(p.openingStock ?? 0) <= Number(p.lowStockAlert ?? 0)
    );
  }, [products]);

  // Total Low Stock Value (dynamic, GST adjusted)
  const totalLowStockValue = useMemo(() => {
    return allLowStockProducts.reduce((acc, p) => {
      return acc + calculateSubtotal(p);
    }, 0);
  }, [allLowStockProducts]);

  const now = new Date();

  const dateFiltered = products.filter((p) => {
    if (!p.createdAt) return true;
    const productDate = new Date(p.createdAt);

    if (dateRange === "today") {
      return productDate.toDateString() === now.toDateString();
    }

    if (dateRange === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return productDate >= startOfWeek && productDate <= now;
    }

    if (dateRange === "month") {
      return (
        productDate.getMonth() === now.getMonth() &&
        productDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateRange === "custom" && date) {
      return productDate.toDateString() === date.toDateString();
    }

    return true;
  });

  // Filtered products for table display (low stock + category filter)
  const filteredProducts = useMemo(() => {
    const now = new Date();

    return (
      dateFiltered
        // Existing category, tax, low stock, sorting filters here...
        .filter(
          (p) => selectedCategory === "all" || p.category === selectedCategory
        )
        .filter((p) => {
          if (taxFilter === "all") return true;
          if (taxFilter === "with") return p.purchasePriceWithTax === true;
          if (taxFilter === "without") return !p.purchasePriceWithTax;
          return true;
        })
        .filter(
          (p) => Number(p.openingStock ?? 0) <= Number(p.lowStockAlert ?? 0)
        )
        .sort((a, b) => {
          if (!sortConfig?.key) return 0;
          const key = sortConfig.key;
          const aVal = a[key] ?? "";
          const bVal = b[key] ?? "";

          if (typeof aVal === "number" && typeof bVal === "number") {
            return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
          }
          return sortConfig.direction === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        })
    );
  }, [
    selectedCategory,
    taxFilter,
    sortConfig,
    dateFiltered,
  ]);

  // Only categories with low stock products
  const categories = useMemo(() => {
    // Filter only low stock products
    const lowStockProducts = products.filter(
      (p) => Number(p.openingStock ?? 0) <= Number(p.lowStockAlert ?? 0)
    );

    // Map their categories and remove undefined/null
    const cats = lowStockProducts
      .map((p) => p.category)
      .filter((c): c is string => !!c);

    // Remove duplicates and sort ascending
    return Array.from(new Set(cats)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Category-wise totals for table display (low stock + GST adjusted)
  const categoryTotals = useMemo(() => {
    // Use filtered low-stock products only
    const lowStockProducts = products.filter(
      (p) => Number(p.openingStock ?? 0) <= Number(p.lowStockAlert ?? 0)
    );

    return lowStockProducts.reduce<Record<string, number>>((totals, p) => {
      const cat = p.category || "Uncategorized";
      totals[cat] = (totals[cat] || 0) + calculateSubtotal(p);
      return totals;
    }, {});
  }, [products]);

  const pdfRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = "Low Stock Summary";
    doc.setFontSize(16);
    doc.text(title, 14, 12);

    // Subtitle
    const subtitle = `Date: ${format(new Date(), "dd/MM/yyyy")}`;
    doc.setFontSize(10);
    doc.text(subtitle, 14, 18);

    // Prepare table body
    const body = filteredProducts.map((p, index) => {
      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const gstPercent = Number(p.taxPercent ?? 0);

      return [
        index + 1,
        p.name,
        gstPercent.toFixed(2),
        purchasePrice.toFixed(2),
        Number(p.sellingPrice ?? 0).toFixed(2),
        openingStock,
        calculateSubtotal(p).toFixed(2),
      ];
    });

    // Column widths and alignment
    autoTable(doc, {
      startY: 24,
      head: [
        [
          "S. No.",
          "Product Name",
          "GST(%)",
          "Purchase Price (₹)",
          "Selling Price (₹)",
          "Current Stock",
          "Stock Value (₹)",
        ],
      ],
      body,
      styles: { fontSize: 9 },
      headStyles: { halign: "left" },
      bodyStyles: { valign: "top" },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        2: { halign: "center" },
        6: { halign: "right" },
      },
      // Grand total in footer
      foot: [
        [
          { content: "Grand Total", colSpan: 6, styles: { halign: "right" } },
          {
            content: `₹${filteredProducts
              .reduce((sum, p) => {
                return sum + calculateSubtotal(p);
              }, 0)
              .toFixed(2)}`,
            styles: { halign: "right" },
          },
        ],
      ],
      footStyles: { fontStyle: "bold" },
    });

    doc.save("low_stock_summary.pdf");
  };
  // Inside your StockSummaryPage component, add this function:

  const exportExcel = () => {
    // Prepare data for Excel
    const dataForExcel = filteredProducts.map((p, index) => {
      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const gstPercent = Number(p.taxPercent ?? 0);

      return {
        "S. No.": index + 1,
        "Product Name": p.name,
        "SKU Code": p.sku || "-",
        "GST (%)": gstPercent.toFixed(2),
        "Purchase Price (₹)": purchasePrice.toFixed(2),
        "Selling Price (₹)": Number(p.sellingPrice ?? 0).toFixed(2),
        "Current Stock": `${openingStock} ${p.unit || ""}`,
        "Stock Value (₹)": calculateSubtotal(p).toFixed(2),
        Category: p.category || "Uncategorized",
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Add a total row at the end
    const totalStockValue = filteredProducts.reduce((acc, p) => {
      return acc + calculateSubtotal(p);
    }, 0);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [["", "", "", "", "", "", "Grand Total", totalStockValue.toFixed(2)]],
      { origin: -1 }
    );

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Low Stock Summary");

    // Export
    XLSX.writeFile(
      workbook,
      `low_stock_summary_${format(new Date(), "ddMMyyyy")}.xlsx`
    );
  };

  const printTable = () => {
    if (!pdfRef.current) return;

    const printContents = pdfRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Low Stock Summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid #000; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        ${printContents}
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
          Low Stock Summary
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Filter and Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 cursor-pointer">
              {/* Search Category Dropdown */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Picker */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-[180px]"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange === "custom"
                        ? date
                          ? format(date, "PPP")
                          : "Select Date"
                        : dateRange === "today"
                        ? "Today"
                        : dateRange === "week"
                        ? "This Week"
                        : dateRange === "month"
                        ? "This Month"
                        : dateRange === "tillToday"
                        ? "Till Today"
                        : "Select Range"}

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-auto"
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

                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => setDateRange("tillToday")}>
                      Till Today
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setDateRange("today")}>
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDateRange("week")}>
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDateRange("month")}>
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="w-full cursor-pointer px-2 py-1.5 rounded hover:bg-gray-100 text-sm">
                            Custom Date...
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                              if (d) {
                                setDate(d);
                                setDateRange("custom");
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium text-sm">
                  Tax Filter:
                </span>
                <Select
                  value={taxFilter}
                  onValueChange={(value: "all" | "with" | "without") =>
                    setTaxFilter(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Tax Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full" /> All
                      Products
                    </SelectItem>
                    <SelectItem
                      value="with"
                      className="flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-blue-500 rounded-full" /> With
                      Tax
                    </SelectItem>
                    <SelectItem
                      value="without"
                      className="flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full" />{" "}
                      Without Tax
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                Print Low Stock Summary
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
          <div ref={pdfRef}>
            {/* Total Stock Value */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">
                Total Low Stock Value:{" "}
                <span className="text-xl font-bold text-gray-900">
                  ₹{" "}
                  <AnimatedNumber value={totalLowStockValue} duration={1200} />
                </span>
              </h2>

              {/* Category-wise Subtotal for selected category only */}
              {selectedCategory !== "all" &&
                categoryTotals[selectedCategory] && (
                  <div className="mt-4 text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded flex justify-between items-center w-64">
                    <span>{selectedCategory}</span>
                    <span>
                      ₹
                      {Math.round(
                        categoryTotals[selectedCategory]
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
            </div>

            {/* Stock Summary Table */}
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead>S. No.</TableHead>
                    <TableHead>PRODUCT NAME</TableHead>
                    <TableHead>SKU CODE</TableHead>
                    <TableHead>GST %</TableHead>
                    <TableHead>PURCHASE PRICE (₹)</TableHead>
                    <TableHead>SELLING PRICE (₹)</TableHead>
                    <TableHead>CURRENT STOCK</TableHead>
                    <TableHead>STOCK VALUE</TableHead>
                    {/* <TableHead>Purchase Product</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <TableSkeleton rows={6} />
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        No low stock products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p, index) => {
                      return (
                        <TableRow key={p._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.sku || "-"}</TableCell>
                          <TableCell>{p.taxPercent || "-"}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <span>₹{p.purchasePrice || "-"}</span>
                            {p.purchasePriceWithTax && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                With Tax
                              </span>
                            )}
                            {!p.purchasePriceWithTax && (
                              <span className="bg-red-100 text-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                                Without Tax
                              </span>
                            )}
                          </TableCell>
                          <TableCell>₹{p.sellingPrice || "-"}</TableCell>
                          <TableCell>
                            {p.openingStock || 0} {p.unit || ""}
                          </TableCell>
                          <TableCell>
                            ₹{Math.round(calculateSubtotal(p)).toLocaleString()}
                          </TableCell>
                          {/* <TableCell><Link href="/dashboard/purchase" className="text-blue-600 hover:underline">Purchase</Link></TableCell> */}
                        </TableRow>
                      );
                    })
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
