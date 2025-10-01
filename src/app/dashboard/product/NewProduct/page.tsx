"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { toast } from "react-hot-toast";
import {
  ChevronDown,
  FileBarChart,
  PackageX,
  TrendingUp,
  Warehouse,
  Layers3,
  ExternalLink,
} from "lucide-react";
import { Product } from "@/types/product";
import Link from "next/link";

const ItemsPageUI = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/product", { credentials: "include" });
      const data = await res.json();
      if (data.success) setProducts(data.products);
      else toast.error("Failed to fetch products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchesLowStock =
        !showLowStockOnly ||
        Number(p.openingStock ?? 0) <= Number(p.lowStockAlert ?? 0);
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, search, selectedCategory, showLowStockOnly]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Product deleted successfully");
      } else toast.error(data.error || "Failed to delete product");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const handleSave = (savedProduct: Product) => {
    const cleanProduct = JSON.parse(JSON.stringify(savedProduct));

    setProducts((prev) => {
      if (editingProduct) {
        return prev.map((p) => (p._id === cleanProduct._id ? cleanProduct : p));
      } else {
        return [...prev, cleanProduct];
      }
    });
    setEditingProduct(null);
    setOpen(false);
  };

  const categories = useMemo(() => {
    const cats = products.map((p) => p.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => {
      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const gstPercent = Number(p.taxPercent ?? 0);
      const gstAmount = (purchasePrice * gstPercent) / 100;
      const subtotal = (purchasePrice - gstAmount) * openingStock;
      return acc + subtotal;
    }, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0)
    ).length;
  }, [products]);

  const handleEdit = (product: Product | null, openFlag: boolean) => {
    setEditingProduct(product); // null if cancel
    setOpen(openFlag); // true to open modal, false to close
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
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
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <Link href="/dashboard/reports/inventory/stock-summary">
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Stock Value
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-gray-400" />
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
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <PackageX className="h-4 w-4 text-orange-500" />
                  Low Stock
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedNumber value={lowStockCount} duration={300} />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
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
              variant={showLowStockOnly ? "secondary" : "outline"}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              Show Low Stock
            </Button>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1">
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
            <Button
              onClick={() => {
                setEditingProduct(null);
                setOpen(true);
              }}
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Product Table */}
        <ProductTable
          allProducts={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {/* Modal Form */}
        <AddProduct
          open={open}
          setOpen={setOpen}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default ItemsPageUI;
