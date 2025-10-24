"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductTable from '@/components/ProductTable';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { Product as ProductType } from '@/types/product';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<ProductType | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products?businessId=${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) {
          console.error('failed to fetch products', await res.text());
          setProducts([]);
          return;
        }
        const json = await res.json();
        const list = json?.products || [];
        if (mounted) setProducts(list);
      } catch (err) {
        console.error('error fetching products', err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  async function handleDelete(pid: string) {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/product?id=${encodeURIComponent(pid)}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        console.error('delete failed', await res.text());
        return;
      }
      // remove locally
      setProducts(prev => prev.filter(p => p._id !== pid));
    } catch (err) {
      console.error('delete error', err);
    }
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border"> <div className="text-sm text-gray-500">Total Products</div> <div className="text-2xl font-semibold">{products.length}</div> </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border"> <div className="text-sm text-gray-500">Low Stock</div> <div className="text-2xl font-semibold">{products.filter(p => (p.currentStock ?? 0) <= (p.lowStockAlert ?? 0)).length}</div> </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border"> <div className="text-sm text-gray-500">Active SKUs</div> <div className="text-2xl font-semibold">{products.filter(p => !!p.sku).length}</div> </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Products</h3>
        </div>

        <div>
          {loading ? <TableSkeleton rows={6} /> : <ProductTable allProducts={products} loading={loading} onEdit={(p, open) => setEditProduct(open ? p : null)} onDelete={handleDelete} showActions={false} />}
        </div>
      </div>

      {/* edit modal placeholder - the project already has AddProduct component elsewhere; keeping minimal here */}
      {editProduct !== undefined && (
        <div />
      )}
    </div>
  );
}
