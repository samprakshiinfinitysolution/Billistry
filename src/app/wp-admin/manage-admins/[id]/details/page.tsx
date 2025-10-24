"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAdmin, refreshAdmins } from '../../data';
import { Input } from '@/components/ui/input';

const Tabs = ({ id }: { id: string }) => {
  const base = `/wp-admin/manage-admins/${id}/details`;
  const tabs = [
    { key: 'products', label: 'Products', href: `${base}/products` },
    { key: 'sales', label: 'Sales', href: `${base}/sales` },
    { key: 'purchase', label: 'Purchase', href: `${base}/purchase` },
    { key: 'sales-return', label: 'Sales Return', href: `${base}/sales-return` },
    { key: 'purchase-return', label: 'Purchase Return', href: `${base}/purchase-return` },
  ];
  return (
    <nav className="flex items-center gap-3 border-b pb-3 mb-4">
      {tabs.map(t => (
        <Link key={t.key} href={t.href} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50">{t.label}</Link>
      ))}
    </nav>
  );
};

export default function AdminDetailsPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(() => getAdmin(id));
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    async function ensureAdmin() {
      if (!admin) {
        setLoading(true);
        try {
          await refreshAdmins();
          const a = getAdmin(id);
          if (mounted) setAdmin(a);
        } catch (err) {
          console.error('failed to refresh admins for details', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    }
    ensureAdmin();
    return () => { mounted = false; };
  }, [admin, id]);

  if (loading) return <div className="p-6 text-gray-600">Loading admin...</div>;
  if (!admin) return <div className="p-6 text-gray-600">Admin not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{admin.name}</h1>
            <p className="text-sm text-gray-500">{admin.store}</p>
          </div>
          <div>
            <button onClick={() => router.push('/wp-admin/manage-admins')} className="px-3 py-2 bg-white border rounded-md">Back</button>
          </div>
        </div>

        {/* Subheading: search + filters similar to Manage Admins list */}
        <div className="md:sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b -mx-6 lg:-mx-8">
          <div className="px-6 lg:px-8 py-2 rounded-b-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3 w-full lg:flex-1">
              <Input className="w-full" value={query} onChange={(e: any) => setQuery(e.target.value)} placeholder={`Search ${admin.store} products, invoices...`} />
            </div>

            <div className="flex items-center gap-4 justify-between w-full lg:w-auto">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-sm text-gray-600">Details</div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Filters</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button className={`px-2.5 py-1 rounded-full text-sm border bg-white border-gray-200 text-gray-700`}>Products</button>
                <button className={`px-2.5 py-1 rounded-full text-sm border bg-white border-gray-200 text-gray-700`}>Sales</button>
                <button className={`px-2.5 py-1 rounded-full text-sm border bg-white border-gray-200 text-gray-700`}>Purchase</button>
                <button className={`px-2.5 py-1 rounded-full text-sm border bg-white border-gray-200 text-gray-700`}>Sales Return</button>
                <button className={`px-2.5 py-1 rounded-full text-sm border bg-white border-gray-200 text-gray-700`}>Purchase Return</button>
              </div>
            </div>
          </div>
        </div>

        <Tabs id={id} />

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Overview</h3>
          <p className="text-sm text-gray-600">Select a tab to view Products, Sales, Purchase, Sales Return and Purchase Return for this admin's business.</p>
        </div>
      </div>
    </div>
  );
}
