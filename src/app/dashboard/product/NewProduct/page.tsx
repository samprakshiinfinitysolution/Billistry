"use client";

import React, { useState, useEffect, useMemo } from "react";

// Import Shadcn UI Components (make sure you've run `npx shadcn-ui@latest add ...`)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductTable from "@/components/ProductTable";
import AddProduct from "@/components/AddProduct";
import AnimatedNumber from "@/components/AnimatedNumber";

// Import Lucide React Icons
import {
  ArrowUpDown,
  Box,
  ChevronDown,
  ExternalLink,
  FileBarChart,
  HelpCircle,
  Layers3,
  PackageX,
  Search,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { Product } from "@/types/product";
import Link from "next/link";

// --- Main Component ---
const ItemsPageUI = () => {
  // State for interactive filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  // Search & filter
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  //Fetching Products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/product", { credentials: "include" });
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // stop loading
      }
    }
    fetchProducts();
  }, []);

  // Filtered products based on search, category, and low stock
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filter by search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(searchLower) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
        (p.category && p.category.toLowerCase().includes(searchLower));

      // Filter by category
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      // Filter by low stock
      const matchesLowStock =
        !showLowStockOnly ||
        Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0);

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, search, selectedCategory, showLowStockOnly]);

  // Get unique categories dynamically from products, sorted ascending
  const categories = useMemo(() => {
    const cats = products
      .map((p) => p.category)
      .filter((c): c is string => !!c); // remove undefined/null
    return Array.from(new Set(cats)).sort((a, b) => a.localeCompare(b)); // sorted alphabetically
  }, [products]);

  // Total stock value
  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => {
      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const gstPercent = Number(p.taxPercent ?? 0);

      const gstAmount = (purchasePrice * gstPercent) / 100; // GST in currency
      const subtotal = (purchasePrice - gstAmount) * openingStock;

      return acc + subtotal;
    }, 0);
  }, [products]);

  // Count of low stock products
  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0)
    ).length;
  }, [products]);
  const handleAddClick = () => {
    setEditingProduct(null); // reset form for new product
    setOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product); // pass product to edit
    setOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileBarChart className="h-4 w-4" />
                  Reports
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/dashboard/reports/inventory/stock-summary">
                    Stock Summary
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/reports/inventory/low-stock">
                    Low Stock Summary
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Stats Cards - Corrected full-width layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <Link href="/dashboard/reports/inventory/stock-summary">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Stock Value
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹ <AnimatedNumber value={totalStockValue} duration={1200} />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card>
            <Link href="/dashboard/reports/inventory/low-stock">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <PackageX className="h-4 w-4 text-orange-500" />
                  Low Stock
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedNumber value={lowStockCount} duration={200} />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Filters and Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search by Name, SKU, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
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

            <Button
              variant={showLowStockOnly ? "secondary" : "outline"} // Change variant when active
              className="w-full md:w-auto"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              Show Low Stock
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex-1">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Bulk Actions
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export Selected</DropdownMenuItem>
                <DropdownMenuItem>Delete Selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AddProduct />
          </div>
        </div>

        {/* Items Table - Maps over the `filteredItems` array */}
        <ProductTable
          products={filteredProducts} // or filteredProducts
          loading={loading}
          onEdit={handleEditClick} // optional, defaults to false
          // handleEdit={handleEdit}
          // handleDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ItemsPageUI;
