"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAdmin, refreshAdmins } from '../../data';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';

const Tabs = ({ id }: { id: string }) => {
  const base = `/wp-admin/manage-admins/${id}/details`;
  const pathname = usePathname() || '';
  const tabs = [
    { key: 'products', label: 'Products', href: `${base}/products` },
    { key: 'sales', label: 'Sales', href: `${base}/sales` },
    { key: 'purchase', label: 'Purchase', href: `${base}/purchase` },
    { key: 'sales-return', label: 'Sales Return', href: `${base}/sales-return` },
    { key: 'purchase-return', label: 'Purchase Return', href: `${base}/purchase-return` },
    { key: 'parties', label: 'Parties', href: `${base}/parties` },
  ];
  return (
    <nav className="flex items-center gap-3 border-b pb-3 mb-4 overflow-auto">
      {tabs.map(t => {
        const active = pathname === t.href || pathname.startsWith(t.href + '/') || pathname === t.href.replace(/\/$/, '');
        return (
          <Link key={t.key} href={t.href} className={`text-sm px-3 py-2 rounded-md ${active ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default function AdminDetailsPage() {
  // Redirect to Products tab by default
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const router = useRouter();
  useEffect(() => {
    if (!id) return;
    // If current path ends with /details or /details/ redirect to products
    try {
      const href = `/wp-admin/manage-admins/${id}/details/products`;
      router.replace(href);
    } catch (e) {}
  }, [id, router]);

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 text-sm text-gray-600">Redirecting to Products...</div>
    </div>
  );
}
