"use client";

import { Button } from "@/components/ui/button"; // Assuming shadcn/ui setup
import { Product } from "@/types/product";
import AnimatedNumber from "@/components/AnimatedNumber";
import { useRef } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
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
import { useRouter } from "next/navigation";

export default function StockSummaryPage() {
  const [date, setDate] = React.useState(new Date());
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    setDate(new Date()); // client pe hi run hoga
  }, []);
  //Fetching Products
  useEffect(() => {
  async function fetchProducts() {
    setLoading(true); // start loading
    try {
      const res = await fetch("/api/product", { credentials: "include" });
      const data = await res.json();
      if (data.success) setProducts(data.products ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // stop loading
    }
  }
  fetchProducts();
}, []);


  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      return selectedCategory === "all" || p.category === selectedCategory;
    });
  }, [products, selectedCategory]);

  // Category-wise totals for table display (GST adjusted)
  const categoryTotals = useMemo(() => {
    return filteredProducts.reduce<Record<string, number>>((totals, p) => {
      const cat = p.category || "Uncategorized";

      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const gstPercent = Number(p.taxPercent ?? 0);

      const gstAmount = (purchasePrice * gstPercent) / 100;
      const subtotal = (purchasePrice - gstAmount) * openingStock;

      totals[cat] = (totals[cat] || 0) + subtotal;
      return totals;
    }, {});
  }, [filteredProducts]);

  // Get unique categories dynamically from products, sorted ascending
  const categories = useMemo(() => {
    const cats = products
      .map((p) => p.category)
      .filter((c): c is string => !!c); // remove undefined/null
    return Array.from(new Set(cats)).sort((a, b) => a.localeCompare(b)); // sorted alphabetically
  }, [products]);

  // Initialize sortConfig with default ascending for 'name'
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  // Total stock value
  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => {
      const stock = Number(p.openingStock || 0);
      const price = Number(p.purchasePrice || 0);
      return acc + stock * price;
    }, 0);
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

      const gstAmount = (purchasePrice * gstPercent) / 100; // GST in currency
      const subtotal = (purchasePrice - gstAmount) * openingStock;

      return [
        index + 1,
        p.name,
        gstPercent.toFixed(2),
        purchasePrice.toFixed(2),
        Number(p.sellingPrice ?? 0).toFixed(2),
        openingStock,
        subtotal.toFixed(2),
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
                const purchasePrice = Number(p.purchasePrice ?? 0);
                const openingStock = Number(p.openingStock ?? 0);
                const gstPercent = Number(p.taxPercent ?? 0);
                const gstAmount = (purchasePrice * gstPercent) / 100;
                const subtotal = (purchasePrice - gstAmount) * openingStock;
                return sum + subtotal;
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
      const gstAmount = (purchasePrice * gstPercent) / 100;
      const subtotal = (purchasePrice - gstAmount) * openingStock;

      return {
        "S. No.": index + 1,
        "Product Name": p.name,
        "SKU Code": p.sku || "-",
        "GST (%)": gstPercent.toFixed(2),
        "Purchase Price (₹)": purchasePrice.toFixed(2),
        "Selling Price (₹)": Number(p.sellingPrice ?? 0).toFixed(2),
        "Current Stock": `${openingStock} ${p.unit || ""}`,
        "Stock Value (₹)": subtotal.toFixed(2),
        Category: p.category || "Uncategorized",
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Add a total row at the end
    const totalStockValue = filteredProducts.reduce((acc, p) => {
      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const gstPercent = Number(p.taxPercent ?? 0);
      const gstAmount = (purchasePrice * gstPercent) / 100;
      const subtotal = (purchasePrice - gstAmount) * openingStock;
      return acc + subtotal;
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
          Stock Summary
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Filter and Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 ">
              {/* Search Category Dropdown */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[180px] cursor-pointer">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    All Categories
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="cursor-pointer"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-max justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Today</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    required
                  />
                </PopoverContent>
              </Popover>
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
                    Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={printTable}
              >
                Print Stock Summary
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
                Total Stock Value:{" "}
                <span className="text-xl font-bold text-gray-900">
                  ₹ <AnimatedNumber value={totalStockValue} duration={1200} />
                </span>
              </h2>

              {/* Category-wise Subtotals */}
              {selectedCategory !== "all" && (
                <div className="mt-4 space-y-1">
                  {Object.entries(categoryTotals).map(
                    ([category, catTotal]) => (
                      <div
                        key={category}
                        className="text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded"
                      >
                        Total {category}: ₹{catTotal.toLocaleString()}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Stock Summary Table */}
            <div className="overflow-x-auto">
              <Table>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          Loading products...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p, index) => {
                      const purchasePrice = Number(p.purchasePrice || 0);
                      const openingStock = Number(p.openingStock || 0);
                      const gstPercent = Number(p.taxPercent || 0);
                      const gstAmount = (purchasePrice * gstPercent) / 100;
                      const subtotal =
                        (purchasePrice - gstAmount) * openingStock;

                      return (
                        <TableRow key={p._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.sku || "-"}</TableCell>
                          <TableCell>{p.taxPercent || "-"}</TableCell>
                          <TableCell>₹{p.purchasePrice || "-"}</TableCell>
                          <TableCell>₹{p.sellingPrice || "-"}</TableCell>
                          <TableCell>
                            {p.openingStock || 0} {p.unit || ""}
                          </TableCell>
                          <TableCell>₹{subtotal.toLocaleString()}</TableCell>
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
