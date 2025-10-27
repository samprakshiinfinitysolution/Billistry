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
  Search,
} from "lucide-react";
import { Product } from "@/types/product";
import Link from "next/link";

const ItemsPageUI = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");
  // Default to latest added so users see newest products first
  const [sortOption, setSortOption] = useState<"a_z" | "z_a" | "latest">("latest");

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/product", {
        method: "GET",
        credentials: "include",
      });
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

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === "a_z") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOption === "z_a") {
      return list.sort((a, b) => b.name.localeCompare(a.name));
    }
    // latest: sort by createdAt descending (newest first)
    return list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [filteredProducts, sortOption]);

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
        fetchProducts();
      } else toast.error(data.error || "Failed to delete product");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };
  const handleSave = async (savedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p._id === savedProduct._id);
      if (exists)
        return prev.map((p) => (p._id === savedProduct._id ? savedProduct : p));
      else return [...prev, savedProduct];
    });
    toast.success("Product saved successfully");
    setOpen(false);
    setEditingProduct(null);
  };

  const categories = useMemo(() => {
    const cats = products.map((p) => p.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const totalStockValue = useMemo(() => {
    return products.reduce((acc, p) => {
      const purchasePrice = Number(p.purchasePrice ?? 0);
      const openingStock = Number(p.openingStock ?? 0);
      const subtotal = purchasePrice * openingStock;
      return acc + subtotal;
    }, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => Number(p.currentStock || 0) <= Number(p.lowStockAlert || 0)
    ).length;
  }, [products]);

  const handleEdit = (product: Product | null, openFlag: boolean) => {
    setEditingProduct(product);
    setOpen(openFlag); 
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Reports
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/dashboard/reports/inventory/stock-summary" className="block w-full">Stock Summary</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/reports/inventory/low-stock" className="block w-full">Low Stock</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setOpen(true);
            }}
            className="ml-2"
          >
            Add Product
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-4 space-y-4 flex flex-col overflow-hidden">
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
          <div className="flex items-center gap-2 flex-wrap w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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

            <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Newest First</SelectItem>
                <SelectItem value="a_z">A to Z</SelectItem>
                <SelectItem value="z_a">Z to A</SelectItem>
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
              <DropdownMenuTrigger>
                <Button variant="outline">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export Selected</DropdownMenuItem>
                <DropdownMenuItem>Delete Selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Table - full-bleed container so the card can touch page edges like sales pages */}
        <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm flex-1 overflow-y-auto">
            <ProductTable
              allProducts={sortedProducts}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
        </div>
        {/* Modal Form */}
        <AddProduct
          open={open}
          setOpen={setOpen}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          onSave={handleSave}
        />
      </main>
    </div>
  );
};

export default ItemsPageUI;
