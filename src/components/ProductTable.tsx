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
import TableSkeleton from '@/components/ui/TableSkeleton';

interface ProductTableProps {
  allProducts: Product[];
  loading?: boolean;
  onEdit: (product: Product | null, open: boolean) => void; // note the null + open flag
  onDelete: (id: string) => void;
  showActions?: boolean;
}


export default function ProductTable({
  allProducts,
  loading = false,
  onEdit,
  onDelete,
  showActions = true,
}: ProductTableProps) {
  // Use the order provided by parent (sorting is handled by caller)
  const sortedProducts = allProducts;


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
          <TableHead>Current Stock</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Low Stock Alert</TableHead>
          <TableHead>Purchase Price</TableHead>
          <TableHead>Selling Price</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={showActions ? 12 : 11} className="p-0">
              <TableSkeleton rows={6} />
            </TableCell>
          </TableRow>
        ) : sortedProducts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showActions ? 12 : 11} className="text-center py-4">
              No products found
            </TableCell>
          </TableRow>
        ) : (
          sortedProducts.map((p, index) => (
            <TableRow
              key={p._id}
              className={`${
                Number(p.currentStock ?? 0) <= Number(p.lowStockAlert ?? 0)
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
              <TableCell>{p.currentStock || 0}</TableCell>
              <TableCell>{p.unit || "-"}</TableCell>
              <TableCell>{p.lowStockAlert || "-"}</TableCell>
              <TableCell>{p.purchasePrice || "-"}</TableCell>
              <TableCell>{p.sellingPrice || "-"}</TableCell>
              {showActions && (
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
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
