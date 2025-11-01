"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Calendar,
  Calculator,
} from "lucide-react";
import { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from "next/link";

const ItemsPageUI = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");
  // Default to latest added so users see newest products first
  const [sortOption, setSortOption] = useState<"a_z" | "z_a" | "latest">("latest");

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustValues, setAdjustValues] = useState({
    date: new Date().toISOString().slice(0, 10),
    action: "add", // 'add' | 'reduce'
    adjustQuantity: "",
  });
  const dateInputRef = useRef<HTMLInputElement | null>(null);
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
        // compare currentStock against lowStockAlert for actual stock status
        Number(p.currentStock ?? 0) <= Number(p.lowStockAlert ?? 0);
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

  const handleAdjustOpen = (product: Product) => {
    setAdjustProduct(product);
    setAdjustValues({
      date: new Date().toISOString().slice(0, 10),
      action: "add",
      adjustQuantity: "",
    });
    setAdjustOpen(true);
  };

  const handleAdjustSubmit = async () => {
    if (!adjustProduct) return;
    try {
      const qty = Number(adjustValues.adjustQuantity || 0);
      let updatedStock = Number(adjustProduct.currentStock ?? 0);
      if (adjustValues.action === "add") updatedStock += qty;
      else updatedStock -= qty;

      const payload: any = { currentStock: updatedStock };

      const res = await fetch(`/api/product?id=${adjustProduct._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Product updated");
        setAdjustOpen(false);
        setAdjustProduct(null);
        // refresh list
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-1.5 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full bg-white"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="cursor-pointer bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all" className="cursor-pointer text-gray-800 dark:text-gray-100">All Categories</SelectItem>
                {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="cursor-pointer text-gray-800 dark:text-gray-100">
                      {cat}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
                <SelectTrigger className="cursor-pointer bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                  <SelectItem value="latest" className="cursor-pointer text-gray-800 dark:text-gray-100">Newest First</SelectItem>
                <SelectItem value="a_z" className="text-gray-800 dark:text-gray-100">A to Z</SelectItem>
                <SelectItem value="z_a" className="text-gray-800 dark:text-gray-100">Z to A</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={
                showLowStockOnly
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                  : ""
              }
            >
              <Warehouse className={`mr-2 h-4 w-4 ${showLowStockOnly ? 'text-red-600' : ''}`} />
              Show Low Stock
            </Button>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="flex items-center">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Bulk Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
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
              onAdjust={handleAdjustOpen}
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
        {/* Adjust dialog */}
        <Dialog open={adjustOpen} onOpenChange={(v) => setAdjustOpen(v)}>
          <DialogContent className="w-full sm:max-w-3xl max-h-[95vh] overflow-y-auto">
            {/* (use DialogContent's built-in close button) */}

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left form */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Adjust Stock Quantity</h3>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Date</label>
                    <div
                      className="relative mt-1 cursor-pointer group"
                      onClick={() => {
                        // try to open native date picker or focus the input
                        const el = dateInputRef.current;
                        if (el) {
                          // showPicker is supported in some browsers
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          if (typeof el.showPicker === "function") el.showPicker();
                          else el.focus();
                        }
                      }}
                    >
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                      <Input
                        // attach ref so we can trigger native picker
                        ref={dateInputRef as any}
                        type="date"
                        value={adjustValues.date}
                        onChange={(e) => setAdjustValues((s) => ({ ...s, date: e.target.value }))}
                        className="pl-10 pr-10 cursor-pointer"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="text-sm text-gray-600">Add or Reduce Stock</label>
                      <Select value={adjustValues.action} onValueChange={(v: any) => setAdjustValues((s) => ({ ...s, action: v }))} >
                        <SelectTrigger className="mt-1 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">Add (+)</SelectItem>
                          <SelectItem value="reduce">Reduce (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">Adjust quantity</label>
                      <div className="mt-1 flex">
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          value={adjustValues.adjustQuantity}
                          onChange={(e) => setAdjustValues((s) => ({ ...s, adjustQuantity: e.target.value }))}
                        />
                        <span className="inline-flex items-center px-3 ml-2 rounded border bg-gray-50">{adjustProduct?.unit || 'PCS'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right summary */}
              <div className="w-full md:w-72 bg-white border rounded p-4 h-min">
                <div>
                  <div className="text-sm font-medium text-gray-700">Item Name</div>
                  <div className="text-sm text-gray-500 mt-1">{adjustProduct?.name || '-'}</div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calculator className="h-4 w-4 text-gray-500" />
                    Stock Calculation
                  </div>

                  <div className="mt-3 border rounded p-3 bg-gray-50">
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>Current Stock</div>
                      <div>{adjustProduct ? Number(adjustProduct.currentStock ?? 0) : 0} {adjustProduct?.unit || 'PCS'}</div>
                    </div>

                    {/* delta + updated: only show when a positive adjust quantity is entered */}
                    {Number(adjustValues.adjustQuantity || 0) > 0 && (
                      <>
                        <div className="flex justify-between items-center mt-3">
                          <div className={`text-sm ${adjustValues.action === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                            {adjustValues.action === 'add' ? 'Stock Added' : 'Stock Reduced'}
                          </div>
                          <div className={`text-sm font-medium ${adjustValues.action === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                            {adjustValues.adjustQuantity ? (adjustValues.action === 'add' ? `+ ${adjustValues.adjustQuantity}` : `- ${adjustValues.adjustQuantity}`) : '0'} {adjustProduct?.unit || 'PCS'}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <div className="text-sm font-medium">Updated Stocks</div>
                          <div className="text-sm font-semibold">
                            {(() => {
                              const current = Number(adjustProduct?.currentStock ?? 0);
                              const qty = Number(adjustValues.adjustQuantity || 0);
                              const updated = adjustValues.action === 'add' ? current + qty : current - qty;
                              return `${updated} ${adjustProduct?.unit || 'PCS'}`;
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setAdjustOpen(false); setAdjustProduct(null); }}>Close</Button>
              <Button onClick={handleAdjustSubmit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ItemsPageUI;
