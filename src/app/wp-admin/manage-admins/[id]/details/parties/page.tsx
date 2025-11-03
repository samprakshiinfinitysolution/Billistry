"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function AdminPartiesPage() {
  const params = useParams() as { id?: string };
  const businessId = params?.id || '';
  const router = useRouter();

  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fieldsMeta, setFieldsMeta] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchParties = async () => {
    setLoading(true);
    try {
  const q = new URLSearchParams();
  if (businessId) q.set('businessId', businessId);
  if (typeFilter && typeFilter !== 'all') q.set('type', typeFilter);
  if (searchTerm) q.set('search', searchTerm);
  const res = await fetch(`/api/admin/parties?${q.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch parties');
  const json = await res.json();
  setParties(Array.isArray(json.parties) ? json.parties : []);
  setFieldsMeta(Array.isArray(json.fields) ? json.fields : []);
      setError(null);
    } catch (err: any) {
      console.error('failed to load parties', err);
      setError(err?.message || String(err));
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!businessId) return;
    let t: any = null;
    // debounce search/filter changes
    t = setTimeout(() => { fetchParties(); }, 400);
    return () => { if (t) clearTimeout(t); };
  }, [businessId, searchTerm, typeFilter]);

  const filtered = useMemo(() => {
    let list = [...parties];
    if (typeFilter !== 'all') list = list.filter(p => (p.partyType || '').toLowerCase() === typeFilter.toLowerCase());
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => ((p.partyName || '') + '').toLowerCase().includes(q) || (p.mobileNumber || '').includes(q));
    }
    return list;
  }, [parties, typeFilter, searchTerm]);

  const formatCurrency = (v: any) => {
    if (v == null || v === '') return '—';
    const n = Number(v || 0);
    return `₹ ${n.toLocaleString()}`;
  };

  const formatDate = (v: any) => {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString();
  };

  const renderCell = (p: any, key: string) => {
    const v = p[key];
    if (key === 'balance' || key === 'openingBalance') return formatCurrency(v ?? p.balance ?? p.openingBalance);
    if (key === 'transactionsCount') return String(v ?? p.transactionsCount ?? 0);
    if (key === 'lastTransaction' || key === 'updatedAt' || key === 'createdAt') return formatDate(v ?? p.lastTransaction ?? p.updatedAt ?? p.createdAt);
    if (key === 'email' || key === 'mobileNumber' || key === 'gstin') return v || '—';
    if (key === 'billingAddress' || key === 'shippingAddress') return v ? String(v).slice(0, 80) + (String(v).length > 80 ? '…' : '') : '—';
    if (v == null) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const handleEdit = (id: string) => router.push(`/dashboard/add-party/${id}`);
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/parties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setParties(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      console.warn('delete party error', e);
      alert('Failed to delete party');
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Parties</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search parties..." value={searchTerm} onChange={e => setSearchTerm((e.target as HTMLInputElement).value)} className="pl-8" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
              <SelectTrigger className="w-44 mt-0">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
            {/* Note: no Create button for superadmin view */}
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500"><TableSkeleton rows={6} /></div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(fieldsMeta && fieldsMeta.length ? fieldsMeta : [
                    { key: 'partyName', label: 'Name' },
                    { key: 'mobileNumber', label: 'Mobile' },
                    { key: 'partyType', label: 'Type' },
                    { key: 'balance', label: 'Balance' },
                  ]).map((f: any) => (
                    <th key={f.key} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(p => (
                  <tr key={p._id}>
                    {(fieldsMeta && fieldsMeta.length ? fieldsMeta : [
                      { key: 'partyName' }, { key: 'mobileNumber' }, { key: 'partyType' }, { key: 'balance' }
                    ]).map((f: any) => (
                      <td key={f.key} className="px-4 py-3 text-sm text-gray-700">{renderCell(p, f.key)}</td>
                    ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={Math.max(1, (fieldsMeta && fieldsMeta.length) ? fieldsMeta.length : 4)} className="px-4 py-3 text-sm text-center text-gray-500">No parties found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
