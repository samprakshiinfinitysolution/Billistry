"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

function fmtDate(d: any) { try { return d ? new Date(d).toLocaleString() : '' } catch (e) { return '' } }
function fmtCurrency(v: any) { if (v === null || v === undefined) return ''; try { return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return String(v); } }

export default function ExpensesPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [items, setItems] = useState<any[]>([]);
  const [fieldsMeta, setFieldsMeta] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  // derived totals
  const totalAmount = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  async function fetchItems() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (id) qs.set('businessId', id);
      if (searchTerm) qs.set('search', searchTerm);
      if (category) qs.set('category', category);
      const res = await fetch(`/api/admin/expenses?${qs.toString()}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      setItems(json.expenses || []);
      setFieldsMeta(json.fields || []);
    } catch (e: any) {
      console.error('fetch expenses failed', e);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(t);
  }, [id, searchTerm, category]);

  // Export removed for WP-admin (superadmin) view

  function renderCell(row: any, key: string) {
    if (key === 'date' || key === 'createdAt' || key === 'updatedAt') return fmtDate(row[key]);
    if (key === 'amount') return fmtCurrency(row[key]);
    if (key === 'expenseNoFormatted' || key === 'category' || key === 'note' || key === 'payeeName') return row[key] || '';
    return (row[key] !== undefined && row[key] !== null) ? String(row[key]) : '';
  }

  const cols = (fieldsMeta && fieldsMeta.length) ? fieldsMeta : [{ key: 'expenseNoFormatted', label: 'Expense No' }, { key: 'date', label: 'Date' }, { key: 'amount', label: 'Amount' }];

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Input aria-label="Search expenses" className="w-72" placeholder="Search note, payee or number" value={searchTerm} onChange={e => setSearchTerm((e.target as HTMLInputElement).value)} />
          <Select value={category} onValueChange={(v) => setCategory(v === '__all__' ? '' : v)}>
              <SelectTrigger className="w-44 mt-0">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Categories</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => fetchItems()}>Refresh</Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Total: <span className="font-medium">{fmtCurrency(totalAmount)}</span></div>
        </div>
      </div>

        {loading ? (
          <div className="text-sm text-gray-600"><TableSkeleton rows={6} /></div>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr className="bg-gray-50 text-left">
                  {cols.map((c: any) => (<th key={c.key} className="px-4 py-3 text-sm font-medium text-gray-700 border-b">{c.label}</th>))}
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <tr key={r._id || i} className={"border-b " + (i % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                    {cols.map((c: any) => <td key={c.key} className="px-4 py-3 text-sm text-gray-800 align-top">{renderCell(r, c.key)}</td>)}
                  </tr>
                ))}
                {(!items || items.length === 0) && !loading && <tr><td colSpan={cols.length} className="px-4 py-6 text-center text-gray-500">No expenses</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
