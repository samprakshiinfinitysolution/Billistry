
"use client";
import { Package, AlertTriangle } from "lucide-react";

import { useEffect, useState, useMemo, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import useAuthGuard from "@/hooks/useAuthGuard";

interface Product {
  _id?: string;
  name: string;
  sku?: string;

  // barcode?: string;
  category?: string;
  // description?: string;
  purchasePrice?: string;
  sellingPrice: string;
  taxPercent?: string;
  hsnCode?: string;
  openingStock?: string;
  // currentStock?: string;
  lowStockAlert?: string;
  unit?: string;
}

// const UNIT_OPTIONS = ["pcs", "kg", "liter", "pack", "box"];
export const UNIT_OPTIONS = [
  "pcs", // Piece
  "unit", // General single item
  "dozen", // 12 pcs
  "pair", // 2 pcs
  "set", // Grouped items
  "pack", // Packet
  "box", // Box
  "carton", // Carton
  "case", // Case (shipping box)
  "bundle", // Bundle
  "roll", // Roll (textiles, paper, cables)
  "sheet", // Sheet (paper, metal, glass)
  "bag", // Bag
  "bottle", // Bottle (beverages, chemicals)
  "can", // Can (drinks, paint, food)
  "tube", // Tube (cosmetics, medicines)
  "sachet", // Sachet (small packets)
  "strip", // Strip (medicine strips, labels)
  "packet", // Alternative to "pack"
  "bar", // Bar (chocolate, soap)
  "piece", // Alternative to pcs
  "item", // Generic item
];

const defaultForm: Product = {
  name: "",
  sku: "",

  // barcode: "",
  category: "",
  // description: "",
  purchasePrice: "",
  sellingPrice: "",
  taxPercent: "",
  hsnCode: "",
  openingStock: "",
  // currentStock: "",
  lowStockAlert: "",
  unit: "pcs",
};

export default function ProductPage() {
  const { user } = useAuthGuard();

  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Product>(defaultForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Search & filter
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/product", { credentials: "include" });
        const data = await res.json();
        if (data.success) setProducts(data.products);
        else toast.error(data.error || "Failed to load products");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      }
    }
    loadProducts();
  }, []);

  // Reset form when dialog closes
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData(defaultForm);
      setEditingProduct(null);
    }
  };

  // Auto-generate SKU
  const generateSKU = () => {
    const random = Math.floor(Math.random() * 9000 + 1000);
    const namePart = formData.name
      .replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 3);
    return `${namePart}-${random}`;
  };

  // Prevent negative values but allow empty string
  const handleNumberChange = (key: keyof Product, value: string) => {
    if (value === "") {
      setFormData({ ...formData, [key]: "" });
      return;
    }
    const num = Math.max(0, Number(value) || 0);
    setFormData({ ...formData, [key]: String(num) });
  };

  // Save or update product
  const handleSaveProduct = async () => {
    if (!formData.name.trim() || !formData.sellingPrice) {
      toast.error("Name & Selling Price are required.");
      return;
    }

    if (!formData.sku) formData.sku = generateSKU();

    setLoading(true);
    try {
      const url = editingProduct
        ? `/api/product?id=${editingProduct._id}`
        : "/api/product";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          openingStock: formData.openingStock ?? 0,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (editingProduct) {
          setProducts(
            products.map((p) =>
              p._id === editingProduct._id ? data.product : p
            )
          );
          toast.success("Product updated successfully");
        } else {
          setProducts([...products, data.product]);
          toast.success("Product added successfully");
        }

        setFormData(defaultForm);
        setEditingProduct(null);
        setOpen(false);
<<<<<<< HEAD
        // Notify other UI components (AddItem modal) that products updated so they can refetch
        try { window.dispatchEvent(new Event('productsUpdated')); } catch (e) { /* ignore */ }
=======
>>>>>>> ce21ec2fdc56a92ea043161788371f59da47de6b
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p._id !== id));
        toast.success("Product deleted successfully");
      } else toast.error(data.error || "Failed to delete product");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase());

      const matchesStock = lowStockOnly
        ? Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0)
        : true;

      return matchesSearch && matchesStock;
    });
  }, [products, search, lowStockOnly]);

  const totalProducts = products.length;
  const lowStockCount = products.filter(
    (p) => Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0)
  ).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Products</h1>
        {/* <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Total: <strong>{totalProducts}</strong>
          </span>
          <span
            className={lowStockCount > 0 ? "text-red-600 font-semibold" : ""}
          >
            Low Stock: <strong>{lowStockCount}</strong>
          </span>
        </div> */}
        <div className="flex items-center gap-6 text-sm">
          {/* Total Products */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow">
            <Package className="w-4 h-4 opacity-80" />
            <span>
              Total: <strong className="text-base">{totalProducts}</strong>
            </span>
          </div>

          {/* Low Stock */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow ${
              lowStockCount > 0
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            }`}
          >
            <AlertTriangle className="w-4 h-4 opacity-80" />
            <span>
              Low Stock: <strong className="text-base">{lowStockCount}</strong>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button
            variant={lowStockOnly ? "destructive" : "outline"}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            {lowStockOnly ? "Showing Low Stock" : "Low Stock Only"}
          </Button>
          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setFormData(defaultForm);
                  setEditingProduct(null);
                }}
              >
                Add Product
              </Button>
            </DialogTrigger>

            {/* Product Form */}
            <DialogContent className="sm:max-w-max w-full max-w-lg mx-auto p-6 rounded-2xl shadow-lg flex flex-col ">
              <DialogHeader className="w-full text-center">
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "New Product"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-y-scroll max-h-[70vh] ">
                {/* Left Column */}
                <div className="space-y-4 ">
                  {/* Name */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="Product Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  {/* SKU */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">SKU</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="SKU"
                        value={formData.sku || ""}
                        readOnly
                      />
                      {/* <Button
                        onClick={() =>
                          setFormData({ ...formData, sku: generateSKU() })
                        }
                      >
                        Generate
                      </Button> */}
                      {!formData._id && ( // only show button for new products
                        <Button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, sku: generateSKU() })
                          }
                        >
                          Generate
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      placeholder="Category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>

                  {/* Purchase Price */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">
                      Purchase Price
                    </label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Purchase Price"
                      value={formData.purchasePrice || ""}
                      onChange={(e) =>
                        handleNumberChange("purchasePrice", e.target.value)
                      }
                    />
                  </div>

                  {/* Selling Price */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">
                      Selling Price *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Selling Price"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        handleNumberChange("sellingPrice", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* GST */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">GST</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="GST %"
                      value={formData.taxPercent}
                      onChange={(e) =>
                        handleNumberChange("taxPercent", e.target.value)
                      }
                    />
                  </div>

                  {/* HSN */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">HSN</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="HSN Code"
                      value={formData.hsnCode}
                      onChange={(e) =>
                        setFormData({ ...formData, hsnCode: e.target.value })
                      }
                    />
                  </div>

                  {/* Opening Stock */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">Opening Stock</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Opening Stock"
                      value={formData.openingStock || ""}
                      onChange={(e) =>
                        handleNumberChange("openingStock", e.target.value)
                      }
                    />
                  </div>

                  {/* Low Stock Alert */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">
                      Low Stock Alert
                    </label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Low Stock Alert"
                      value={formData.lowStockAlert || ""}
                      onChange={(e) =>
                        handleNumberChange("lowStockAlert", e.target.value)
                      }
                    />
                  </div>

                  {/* Unit */}
                  <div className="flex flex-col space-y-1 p-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Select
                      value={formData.unit}
                      onValueChange={(val) =>
                        setFormData({ ...formData, unit: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <Button
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="w-full"
                >
                  {loading
                    ? editingProduct
                      ? "Updating..."
                      : "Saving..."
                    : editingProduct
                    ? "Update"
                    : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>




      {/* Product Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                SKU
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                HSN
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                GST
              </th>

              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Stock
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Unit
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Low Stock Alert
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Purchase Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Selling Price
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr
                  key={p._id}
                  className={
                    Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0)
                      ? "bg-red-50"
                      : ""
                  }
                >
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.sku}</td>
                  <td className="px-4 py-2">{p.hsnCode || "-"}</td>
                  <td className="px-4 py-2">{p.taxPercent || "-"}</td>
                  <td className="px-4 py-2">{p.category || "-"}</td>
                  <td className="px-4 py-2">{p.openingStock || 0}</td>
                  <td className="px-4 py-2">{p.unit || "-"}</td>
                  <td className="px-4 py-2">{p.lowStockAlert || "-"}</td>
                  {/* <td className="px-4 py-2">{p.purchasePrice || "-"}</td> */}
                  <td className="px-4 py-2">
                    {user?.permissions?.visibility?.viewAmounts
                      ? `${p.purchasePrice ?? "-"}`
                      : "••••"}
                  </td>

                  <td className="px-4 py-2">{p.sellingPrice || "-"}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                   
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </Button>
                  
                   
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p._id!)}
                      >
                        Delete
                      </Button>
                  
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>




    </div>
  );
}
