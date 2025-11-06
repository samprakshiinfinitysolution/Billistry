"use client";

import { calculateSubtotal } from "@/utils/productCalculations";
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
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import TableSkeleton from "@/components/ui/TableSkeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { ChevronDown, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StockSummaryPage() {
  const [date, setDate] = React.useState(new Date());
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  const [taxFilter, setTaxFilter] = useState<"all" | "with" | "without">("all");

  useEffect(() => setDate(new Date()), []);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/product", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (data?.success) setProducts(data.products ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => selectedCategory === "all" || p.category === selectedCategory)
      .filter((p) => {
        if (taxFilter === "all") return true;
        if (taxFilter === "with") return p.purchasePriceWithTax === true;
        if (taxFilter === "without") return !p.purchasePriceWithTax;
        return true;
      })
      .sort((a, b) => {
        const key = sortConfig.key as keyof Product;
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [products, selectedCategory, taxFilter, sortConfig]);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])).sort(), [products]);

  const totalStockValue = useMemo(() => products.reduce((acc, p) => acc + (Number(p.openingStock || 0) * Number(p.purchasePrice || 0)), 0), [products]);

  const pdfRef = useRef<HTMLDivElement | null>(null);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Stock Summary", 14, 12);
    autoTable(doc, {
      startY: 20,
      head: [["S.No", "Product", "GST%", "Purchase", "Selling", "Stock", "Value"]],
      body: filteredProducts.map((p, i) => [i + 1, p.name, p.taxPercent ?? '-', Number(p.purchasePrice || 0).toFixed(2), Number(p.sellingPrice || 0).toFixed(2), p.openingStock ?? 0, calculateSubtotal(p).toFixed(2)])
    });
    doc.save(`stock_summary_${format(new Date(), 'ddMMyyyy')}.pdf`);
  };

  const exportExcel = () => {
    const rows = filteredProducts.map((p, i) => ({
      "S.No": i + 1,
      Product: p.name,
      GST: p.taxPercent ?? "-",
      Purchase: Number(p.purchasePrice || 0).toFixed(2),
      Selling: Number(p.sellingPrice || 0).toFixed(2),
      Stock: p.openingStock ?? 0,
      Value: calculateSubtotal(p).toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Summary");
    XLSX.writeFile(wb, `stock_summary_${format(new Date(), 'ddMMyyyy')}.xlsx`);
  };

  const printTable = () => {
    if (!pdfRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Stock Summary</title></head><body>${pdfRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 flex items-center">
        <div className="flex items-center text-lg font-semibold text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" onClick={() => router.back()} className="h-5 w-5 mr-2 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Stock Summary
        </div>
      </header>

      <main className="container mx-auto p-6 flex-1 flex flex-col overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px] cursor-pointer"><SelectValue placeholder="Select Category"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-max justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date,'PPP') : 'Today'}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} required/></PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium text-sm">Tax Filter:</span>
                <Select value={taxFilter} onValueChange={(v:any)=>setTaxFilter(v)}>
                  <SelectTrigger className="w-[180px] cursor-pointer"><SelectValue placeholder="Select Tax Filter"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="flex items-center gap-2"><span className="w-2 h-2 bg-gray-400 rounded-full" /> All Products</SelectItem>
                    <SelectItem value="with" className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full" /> With Tax</SelectItem>
                    <SelectItem value="without" className="flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full" /> Without Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 cursor-pointer">Export Options <ChevronDown className="w-4 h-4 text-gray-600 ml-1" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportExcel}>Download Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPDF}>Download PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="flex items-center gap-2 cursor-pointer" onClick={printTable}>Print Stock Summary <Printer className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>

          <div ref={pdfRef} className="flex-1 flex flex-col overflow-hidden" id="report-content">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-700">Total Stock Value: <span className="text-xl font-bold text-gray-900">₹ <AnimatedNumber value={totalStockValue} duration={1200} /></span></h2>
            </div>

            <div className="flex-1 overflow-hidden">
              <Table wrapperClassName="h-full overflow-y-auto overflow-x-hidden" className="w-full table-fixed text-sm h-full">
                <colgroup>
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '26%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>

                <TableHeader className="bg-gray-100 sticky top-0 z-20">
                  <TableRow>
                    <TableHead className="sticky left-0 top-0 bg-gray-100 z-30">S. No.</TableHead>
                    <TableHead className="whitespace-normal">PRODUCT NAME</TableHead>
                    <TableHead>SKU CODE</TableHead>
                    <TableHead>GST %</TableHead>
                    <TableHead>PURCHASE PRICE (₹)</TableHead>
                    <TableHead className="min-w-[110px] text-right">SELLING PRICE (₹)</TableHead>
                    <TableHead className="min-w-[90px] text-right">CURRENT STOCK</TableHead>
                    <TableHead className="min-w-[110px] text-right">STOCK VALUE</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="p-0"><TableSkeleton rows={6} /></TableCell></TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-4 text-gray-500">No products found</TableCell></TableRow>
                  ) : (
                    filteredProducts.map((p, index) => {
                      const subtotal = calculateSubtotal(p);
                      return (
                        <TableRow key={p._id}>
                          <TableCell className="sticky left-0 bg-white z-10">{index + 1}</TableCell>
                          {/* allow product name to wrap into next line when long */}
                          <TableCell className="whitespace-normal break-words max-w-[36ch]">{p.name}</TableCell>
                          <TableCell>{p.sku || '-'}</TableCell>
                          <TableCell>{p.taxPercent ?? '-'}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <span>₹{p.purchasePrice ?? '-'}</span>
                            {p.purchasePriceWithTax && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                With Tax
                              </span>
                            )}
                            {p.purchasePriceWithTax === false && (
                              <span className="bg-red-100 text-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                                Without Tax
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[110px] text-right whitespace-nowrap">₹{p.sellingPrice ?? '-'}</TableCell>
                          <TableCell className="min-w-[90px] text-right whitespace-nowrap">{p.openingStock ?? 0} {p.unit || ''}</TableCell>
                          <TableCell className="min-w-[110px] text-right whitespace-nowrap">₹{subtotal.toLocaleString()}</TableCell>
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
