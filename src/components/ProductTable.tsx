"use client";

import React, { useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
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
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    // runtime debug: walk up ancestors and report styles that commonly break position:sticky
    if (typeof window === 'undefined') return;
    const el = tableRef.current;
    if (!el) return;
    const problematic: Array<{el: Element, props: Record<string,string>}> = [];
    let node: Element | null = el.parentElement;
    while (node) {
      const cs = window.getComputedStyle(node as Element);
      const props: Record<string,string> = {};
      if (cs.transform && cs.transform !== 'none') props.transform = cs.transform;
      if (cs.filter && cs.filter !== 'none') props.filter = cs.filter;
      if (cs.perspective && cs.perspective !== 'none') props.perspective = cs.perspective;
      if (cs.contain && cs.contain !== 'none') props.contain = cs.contain;
      if (cs.willChange && cs.willChange !== 'auto') props.willChange = cs.willChange;
      if (cs.overflow && cs.overflow !== 'visible') props.overflow = cs.overflow;
      if (cs.overflowY && cs.overflowY !== 'visible') props.overflowY = cs.overflowY;
      if (Object.keys(props).length) problematic.push({ el: node, props });
      node = node.parentElement;
    }
    if (problematic.length) {
      console.warn('ProductTable: found ancestor styles that can block position:sticky', problematic);
    } else {
      console.info('ProductTable: no ancestor blocking styles detected for sticky header');
    }
  }, []);


  return (
    <table ref={tableRef} className="w-full">
      <thead>
        <tr className="border-b dark:border-gray-700">
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN Code</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST (%)</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock Alert</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
          <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
          {showActions && <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={showActions ? 12 : 11} className="p-0">
              <TableSkeleton rows={6} />
            </td>
          </tr>
        ) : sortedProducts.length === 0 ? (
          <tr>
            <td colSpan={showActions ? 12 : 11} className="text-center py-4 text-sm">
              No products found
            </td>
          </tr>
        ) : (
          sortedProducts.map((p, index) => (
            <tr
              key={p._id}
              className={`border-b dark:border-gray-700 ${
                Number(p.currentStock ?? 0) <= Number(p.lowStockAlert ?? 0)
                  ? "!bg-red-200"
                  : ""
              }`}
            >
              <td className="px-3 py-2 text-sm">{index + 1}</td>
              <td className="px-3 py-2 text-sm">{p.name}</td>
              <td className="px-3 py-2 text-sm">{p.sku || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.hsnCode || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.taxPercent || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.category || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.currentStock || 0}</td>
              <td className="px-3 py-2 text-sm">{p.unit || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.lowStockAlert || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.purchasePrice || "-"}</td>
              <td className="px-3 py-2 text-sm">{p.sellingPrice || "-"}</td>
              {showActions && (
                <td className="px-3 py-2 text-right">
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
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
