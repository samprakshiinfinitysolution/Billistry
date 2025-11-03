"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdmin, refreshAdmins } from '../../data';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { usePathname } from 'next/navigation';
import { Box, ShoppingCart, Archive, CornerUpLeft, CornerDownRight, Users } from 'lucide-react';

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
    { key: 'cashbook', label: 'Cashbook', href: `${base}/cashbook` },
    { key: 'expenses', label: 'Expenses', href: `${base}/expenses` },
  ];
  return (
    <div className="relative">
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-2 border rounded-md bg-white shadow-sm">
        {tabs.map(t => {
          const active = pathname === t.href || pathname.startsWith(t.href + '/') || pathname === t.href.replace(/\/$/, '');
          const baseClasses = `inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors`;
          const activeClasses = 'bg-indigo-600 text-white shadow-sm';
          const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
          const Icon = t.key === 'products' ? Box : t.key === 'sales' ? ShoppingCart : t.key === 'purchase' ? Archive : t.key === 'sales-return' ? CornerUpLeft : t.key === 'parties' ? Users : t.key === 'cashbook' ? CornerDownRight : t.key === 'expenses' ? Users : CornerDownRight;
          return (
            <Link key={t.key} href={t.href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* active underline */}
      <div className="h-px bg-gray-100 mt-2" />
    </div>
  );
};

export default function DetailsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [admin, setAdmin] = useState<any>(() => getAdmin(id));
  const [loading, setLoading] = useState(false);

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
          console.error('failed to refresh admins for details layout', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    }
    ensureAdmin();
    return () => { mounted = false; };
  }, [admin, id]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!admin) return <div className="p-6 text-gray-600">Admin not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{admin.name}</h1>
            <p className="text-sm text-gray-500">{admin.store}</p>
          </div>
        </div>

        <Tabs id={id} />

        <div>{children}</div>
      </div>
    </div>
  );
}
