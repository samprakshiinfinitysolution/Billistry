"use client";

import { Product } from "@/types/product";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
interface ProductTableProps {
  products: Product[];
  loading?: boolean; // optional
  onEdit: (product: Product) => void;
  // handleDelete: (id: string) => void;
}

export default function ProductTable({
  products,
  loading = false,
  onEdit,
}: ProductTableProps) {
  const [product, setProduct] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); //

  // Initialize sortConfig with default ascending for 'name'
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  // Handle sorting when header clicked
  const handleSort = (key: keyof Product) => {
    if (sortConfig && sortConfig.key === key) {
      // Toggle direction
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  // Memoized sorted products
  const sortedProducts = useMemo(() => {
    if (!sortConfig) return products;

    const sorted = [...products].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      // Convert to string and compare case-insensitive
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Numeric comparison
      return sortConfig.direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    return sorted;
  }, [products, sortConfig]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProduct(products.filter((p) => p._id !== id));
        toast.success("Product deleted successfully");
      } else toast.error(data.error || "Failed to delete product");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>S. No.</TableHead>
          <TableHead>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Product Name
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </div>
          </TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>HSN</TableHead>
          <TableHead>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("taxPercent")}
            >
              GST %
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </div>
          </TableHead>
          <TableHead>Category</TableHead>
          <TableHead>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("openingStock")}
            >
              Opening Stock
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </div>
          </TableHead>{" "}
          <TableHead>Unit</TableHead>
          <TableHead>Low Stock Alert</TableHead>
          <TableHead>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("purchasePrice")}
            >
              Purchase Price
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </div>
          </TableHead>
          <TableHead>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort("sellingPrice")}
            >
              Selling Price
              <ArrowUpDown className="h-3 w-3 text-gray-400" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-4">
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
        ) : products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-4 text-gray-500">
              No products found
            </TableCell>
          </TableRow>
        ) : (
          sortedProducts.map((p, index) => {
            const purchasePrice = Number(p.purchasePrice || 0);
            const openingStock = Number(p.openingStock || 0);
            const gstPercent = Number(p.taxPercent || 0);
            const gstAmount = (purchasePrice * gstPercent) / 100;
            const subtotal = (purchasePrice - gstAmount) * openingStock;

            return (
              <TableRow
                key={p._id}
                className={
                  Number(p.openingStock || 0) <= Number(p.lowStockAlert || 0)
                    ? "!bg-red-300"
                    : ""
                }
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.sku || "-"}</TableCell>
                <TableCell>{p.hsnCode || "-"}</TableCell>
                <TableCell>{p.taxPercent || "-"}</TableCell>
                <TableCell>{p.category || "-"}</TableCell>
                <TableCell>{p.openingStock || 0}</TableCell>
                <TableCell>{p.unit || "-"}</TableCell>
                <TableCell>{p.lowStockAlert || "-"}</TableCell>
                <TableCell>{p.purchasePrice || "-"}</TableCell>
                <TableCell>{p.sellingPrice || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-gray-100 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(p)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-3 w-3" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(p._id)}
                        className="!text-red-500 cursor-pointer"
                      >
                        <Trash className="mr-2 h-3 w-3 !text-red-500" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
