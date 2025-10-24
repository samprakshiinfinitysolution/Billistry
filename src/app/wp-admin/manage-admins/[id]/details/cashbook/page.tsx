"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

function fmtDate(d: any) {
  try { return d ? new Date(d).toLocaleString() : '' } catch (e) { return '' }
}
function fmtCurrency(v: any) {
  if (v === null || v === undefined) return '';
  try { return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } catch (e) { return String(v); }
}

export default function CashbookPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [entries, setEntries] = useState<any[]>([]);
  const [fieldsMeta, setFieldsMeta] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function fetchEntries() {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (id) params.set('businessId', id);
      if (searchTerm) params.set('search', searchTerm);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/admin/cashbook?${params.toString()}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      setEntries(json.entries || []);
      setFieldsMeta(json.fields || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let t: any;
    t = setTimeout(() => fetchEntries(), 300);
    return () => clearTimeout(t);
  }, [id, searchTerm, typeFilter]);

  function renderCell(row: any, key: string) {
    if (key === 'date' || key === 'createdAt' || key === 'updatedAt') return fmtDate(row[key]);
    if (key === 'amount' || key === 'balance') return fmtCurrency(row[key]);
    if (key === 'description' || key === 'reference' || key === 'type') return row[key] || '';
    if (key === 'partyName' || key === 'partyMobile') return row[key] || '';
    return (row[key] !== undefined && row[key] !== null) ? String(row[key]) : '';
  }

  const cols = (fieldsMeta && fieldsMeta.length) ? fieldsMeta : [ { key: 'date', label: 'Date' }, { key: 'description', label: 'Description' }, { key: 'amount', label: 'Amount' } ];

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-4">
        <Input placeholder="Search description, reference or party" value={searchTerm} onChange={e => setSearchTerm((e.target as HTMLInputElement).value)} />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-44 mt-0">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
          </SelectContent>
        </Select>
        </div>

        {loading ? (
          <div className="text-sm text-gray-600"><TableSkeleton rows={6} /></div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {cols.map((c: any) => (
                    <th
                      key={c.key}
                      className={
                        "px-3 py-2 text-sm font-medium " +
                        (c.key === 'description'
                          ? 'min-w-[10rem] md:min-w-[20rem] lg:min-w-[28rem] whitespace-normal'
                          : '')
                      }
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((r, i) => (
                  <tr key={r._id || i} className="border-b">
                    {cols.map((c: any) => (
                      <td
                        key={c.key}
                        className={
                          "px-3 py-2 text-sm " +
                          (c.key === 'description'
                            ? 'min-w-[10rem] md:min-w-[20rem] lg:min-w-[28rem] whitespace-normal break-words'
                            : '')
                        }
                      >
                        {renderCell(r, c.key)}
                      </td>
                    ))}
                  </tr>
                ))}
                {(!entries || entries.length === 0) && <tr><td colSpan={cols.length} className="px-3 py-6 text-center text-gray-500">No entries</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
