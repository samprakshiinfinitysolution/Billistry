"use client";

import { Product } from "@/types/product";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ProductTableProps {
  allProducts: Product[];
  loading?: boolean;
  onEdit: (product: Product | null, open: boolean) => void; // note the null + open flag
  onDelete: (id: string) => void;
}


export default function ProductTable({
  allProducts,
  loading = false,
  onEdit,
  onDelete,
}: ProductTableProps) {
  // Sort products by name ascending
  const sortedProducts = [...allProducts].sort((a, b) =>
    a.name.localeCompare(b.name)
  );


  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>S. No.</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>HSN Code</TableHead>
          <TableHead>GST (%)</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Opening Stock</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Low Stock Alert</TableHead>
          <TableHead>Purchase Price</TableHead>
          <TableHead>Selling Price</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-4">
              Loading products...
            </TableCell>
          </TableRow>
        ) : sortedProducts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center py-4">
              No products found
            </TableCell>
          </TableRow>
        ) : (
          sortedProducts.map((p, index) => (
            <TableRow
              key={p._id}
              className={`${
                Number(p.openingStock ?? 0) <= Number(p.lowStockAlert ?? 0)
                  ? "!bg-red-200"
                  : ""
              }`}
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
                  <DropdownMenuContent align="end" className="pointer-events-auto">
                    <DropdownMenuItem onClick={() => onEdit(p,true)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(p._id)}>
                      <Trash className="mr-2 h-4 w-4 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
