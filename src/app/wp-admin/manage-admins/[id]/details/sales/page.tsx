"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import TableSkeleton from '@/components/ui/TableSkeleton';

export default function SalesPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [partyQuery, setPartyQuery] = useState<string>('');
  const [partySelect, setPartySelect] = useState<string>('all');
  const [productSelect, setProductSelect] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // helper: format header key into human label
  const formatHeader = (k: string) => {
    if (!k) return '';
    const map: Record<string, string> = {
      invoiceNo: 'Invoice No',
      invoiceNumber: 'Invoice No',
      invoiceDate: 'Date',
      createdAt: 'Date',
      selectedParty: 'Party',
      partyName: 'Party',
      items: 'Items',
      paymentStatus: 'Payment Status',
      payment_status: 'Payment Status',
      totalAmount: 'Amount',
      invoiceAmount: 'Amount',
      amountReceived: 'Received',
      receivedAmount: 'Received',
      balanceAmount: 'Balance',
      balance: 'Balance',
    };
    if (map[k]) return map[k];
    // prettify camelCase / snake_case
    return k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase());
  };

  // helper: render cell value for key
  const renderCell = (row: any, k: string, productsList: any[]) => {
    const v = row[k];
    // handle items specially
    if (k === 'items' && Array.isArray(v)) {
      return (
        <div className="flex flex-col gap-1">
          {v.map((it: any, idx: number) => {
            const name = it.name || (it._product && it._product.name) || it.productName || it.itemName || it.product || it.sku || 'item';
            const qty = it.quantity ?? it.qty ?? it.count ?? it.q ?? it.itemQty ?? 1;
            const rate = it.rate ?? it.price ?? it.unitPrice ?? (it._product && (it._product.price ?? it._product.rate ?? it._product.mrp)) ?? null;
            return (
              <div key={idx} className="text-sm text-gray-700">
                <span className="font-medium">{name}</span>
                <span className="text-gray-500"> &nbsp;×&nbsp;{qty}</span>
                {rate != null ? <span className="text-gray-400"> &nbsp;@ ₹{Number(rate).toLocaleString()}</span> : null}
              </div>
            );
          })}
        </div>
      );
    }

    // dates: keys containing 'date' or keys that end with 'At' (createdAt)
    if (k.toLowerCase().includes('date') || k.endsWith('At') || k.endsWith('at')) {
      const dateStr = v || row['invoiceDate'] || row['createdAt'];
      if (!dateStr) return '—';
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return '—';
      // show date on first line and time on second line (HH:MM:SS)
      const datePart = dt.toLocaleDateString();
      const timePart = dt.toLocaleTimeString();
      return (
        <div>
          <div>{datePart}</div>
          <div className="text-xs text-gray-500">{timePart}</div>
        </div>
      );
    }

    // amounts
    if (/amount|total|balance|price|received/i.test(k)) {
      const num = Number(v ?? row.totalAmount ?? row.invoiceAmount ?? 0);
      return `₹ ${num.toLocaleString()}`;
    }

    // object (party)
    if (k === 'selectedParty' && v && typeof v === 'object') {
      return v.name || v.partyName || '—';
    }

    // additionalCharges: render list of name + amount
    if (k === 'additionalCharges' && Array.isArray(v)) {
      return (
        <div className="flex flex-col gap-1">
          {v.map((c: any, i: number) => (
            <div key={i} className="text-sm text-gray-700">
              <span className="font-medium">{c.name || c.title || `Charge ${i+1}`}</span>
              <span className="text-gray-500"> &nbsp;—&nbsp; </span>
              <span className="text-gray-700">₹ {Number(c.amount ?? c.value ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }

    // fallback: primitive or object
    if (v == null) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
  const res = await fetch(`/api/admin/new_sale?businessId=${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) {
          console.error('failed to fetch sales', await res.text());
          setSales([]);
          return;
        }
        const json = await res.json();
        const list = json?.data || [];
        // if backend provided fields metadata, store it on window for client to use
        try {
          if (json?.fields && Array.isArray(json.fields)) {
            // attach to window for dev/debug usage
            (window as any).__admin_new_sale_fields = json.fields;
          }
        } catch (e) {}
        if (mounted) setSales(list);
      } catch (err) {
        console.error('error fetching sales', err);
        if (mounted) setSales([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  // load products for this business to enrich item display
  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        const res = await fetch(`/api/admin/products?businessId=${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) {
          console.warn('failed to fetch products for sales details', await res.text());
          if (mounted) setProducts([]);
          return;
        }
        const json = await res.json();
        const list = json?.products || [];
        if (mounted) setProducts(list);
      } catch (e) {
        console.warn('error loading products for sales details', e);
        if (mounted) setProducts([]);
      }
    }
    if (id) loadProducts();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="text-2xl font-semibold">₹ {sales.reduce((s, a) => s + (Number(a.totalAmount || a.invoiceAmount || 0) || 0), 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Invoices</div>
          <div className="text-2xl font-semibold">{sales.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Avg Ticket</div>
          <div className="text-2xl font-semibold">₹ {sales.length ? Math.round((sales.reduce((s, a) => s + (Number(a.totalAmount || a.invoiceAmount || 0) || 0), 0) || 0) / sales.length) : 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Sales</h3>
        </div>
        <div>
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-2">
            <div>
              <label className="text-xs text-gray-500">From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Party</label>
              <select value={partySelect} onChange={e => setPartySelect(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1">
                <option value="all">All</option>
                {/* populate parties from sales list */}
                {Array.from(new Set(sales.map(s => ((s.selectedParty && (s.selectedParty.name || s.selectedParty.partyName)) || s.partyName || '').trim()).filter(Boolean))).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Product</label>
              <select value={productSelect} onChange={e => setProductSelect(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1">
                <option value="all">All</option>
                {products.map((p: any) => (
                  <option key={p._id} value={String(p._id)}>{p.name || p.title || p.productName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Search</label>
              <input placeholder="Search invoice, party, product..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Status</label>
              <select value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Min Amount</label>
              <input type="number" placeholder="Min" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Max Amount</label>
              <input type="number" placeholder="Max" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => { setStartDate(''); setEndDate(''); setPartyQuery(''); setPaymentStatusFilter('all'); setMinAmount(''); setMaxAmount(''); }} className="px-3 py-1 bg-gray-100 rounded">Clear</button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Dynamic columns: compute from filtered sales but keep common ones first */}
                  {/** We'll render header cells below using columns array **/}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <TableSkeleton rows={3} />
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-4 text-center text-sm text-gray-500">No sales found</TableCell>
                  </TableRow>
                ) : null}
                {
                  // Prepare filtered sales and dynamic columns
                  (() => {
                    const applyFilters = (arr: any[]) => {
                      return arr.filter((s: any) => {
                        const amount = Number(s.totalAmount || s.invoiceAmount || 0);
                        const dateStr = s.invoiceDate || s.createdAt;
                        const date = dateStr ? new Date(dateStr) : null;
                        if (startDate && date) {
                          const sd = new Date(startDate + 'T00:00:00');
                          if (date < sd) return false;
                        }
                        if (endDate && date) {
                          const ed = new Date(endDate + 'T23:59:59');
                          if (date > ed) return false;
                        }
                        // party select
                        if (partySelect && partySelect !== 'all') {
                          const partyName = ((s.selectedParty && (s.selectedParty.name || s.selectedParty.partyName)) || s.partyName || '').trim();
                          if (partyName !== partySelect) return false;
                        }
                        if (partyQuery) {
                          const partyName = (s.selectedParty && (s.selectedParty.name || s.selectedParty.partyName)) || s.partyName || '';
                          if (!partyName.toLowerCase().includes(partyQuery.toLowerCase())) return false;
                        }
                        if (paymentStatusFilter && paymentStatusFilter !== 'all') {
                          // normalize status: try explicit status field first
                          let statusRaw = (s.paymentStatus || s.payment_status || s.paymentMode || s.payment_mode || '').toString().toLowerCase();
                          // common payment modes that imply paid
                          const paidModes = new Set(['paid','cash','upi','card','netbanking','bank','bank_transfer','bank-transfer','cheque','online']);
                          let inferredStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';

                          const amountTotal = Number(s.totalAmount || s.invoiceAmount || 0);
                          const amountReceived = Number(s.amountReceived || s.receivedAmount || s.amount || 0);

                          if (statusRaw && paidModes.has(statusRaw)) {
                            inferredStatus = 'paid';
                          } else if (statusRaw === 'paid' || statusRaw === 'paid_full' || statusRaw === 'full') {
                            inferredStatus = 'paid';
                          } else if (statusRaw === 'partial' || statusRaw === 'partially_paid') {
                            inferredStatus = 'partial';
                          } else if (statusRaw === 'unpaid' || statusRaw === 'due') {
                            inferredStatus = 'unpaid';
                          } else {
                            // fallback to numeric inference
                            if (amountTotal > 0 && amountReceived >= amountTotal) inferredStatus = 'paid';
                            else if (amountReceived > 0 && amountReceived < amountTotal) inferredStatus = 'partial';
                            else inferredStatus = 'unpaid';
                          }

                          if (paymentStatusFilter === 'paid' && inferredStatus !== 'paid') return false;
                          if (paymentStatusFilter === 'partial' && inferredStatus !== 'partial') return false;
                          if (paymentStatusFilter === 'unpaid' && inferredStatus !== 'unpaid') return false;
                        }
                        if (minAmount) {
                          if (amount < Number(minAmount)) return false;
                        }
                        if (maxAmount) {
                          if (amount > Number(maxAmount)) return false;
                        }
                        // product select: check items' productId or sku
                        if (productSelect && productSelect !== 'all') {
                          const has = Array.isArray(s.items) && s.items.some((it: any) => String(it.productId || it.product || it._product?._id) === String(productSelect));
                          if (!has) return false;
                        }
                        // general search across invoiceNo, party, item names
                        if (searchQuery) {
                          const q = searchQuery.toLowerCase();
                          const invoiceHit = (s.invoiceNo || s.invoiceNumber || '').toString().toLowerCase().includes(q);
                          const partyHit = (((s.selectedParty && (s.selectedParty.name || s.selectedParty.partyName)) || s.partyName || '') + '').toLowerCase().includes(q);
                          const itemsHit = Array.isArray(s.items) && s.items.some((it: any) => (it.name || it.productName || (it._product && it._product.name) || '').toString().toLowerCase().includes(q));
                          if (!(invoiceHit || partyHit || itemsHit)) return false;
                        }
                        return true;
                      });
                    };

                    const filtered = applyFilters(sales || []);

                    // compute column keys
                    const seen = new Set<string>();
                    const preferred: string[] = ['invoiceNo', 'invoiceNumber', 'invoiceNo', 'invoiceNumber', 'invoiceNo', 'invoiceNo', 'invoiceNumber', 'invoiceNo', 'invoiceNumber'];
                    const topOrder = ['invoiceNo', 'invoiceNumber', 'invoiceNo', 'invoiceNumber', 'invoiceNo', 'invoiceNo', 'invoiceNumber'];
                    const alwaysFirst = ['invoiceNo', 'invoiceNumber', 'invoiceNo', 'invoiceNumber'];
                    const keys: string[] = [];

                    // helper to push unique
                    const pushIf = (k: string | undefined) => { if (k && !seen.has(k)) { seen.add(k); keys.push(k); } };

                    // prefer common human-friendly columns first
                    pushIf('invoiceNo'); pushIf('invoiceNumber'); pushIf('invoiceNo');
                    pushIf('invoiceDate'); pushIf('createdAt'); pushIf('selectedParty'); pushIf('partyName'); pushIf('items'); pushIf('paymentStatus');
                    pushIf('totalAmount'); pushIf('invoiceAmount'); pushIf('amountReceived'); pushIf('receivedAmount'); pushIf('balanceAmount'); pushIf('balance');

                    // then scan all rows for other keys
                    for (const s of filtered) {
                      if (!s || typeof s !== 'object') continue;
                      for (const k of Object.keys(s)) pushIf(k);
                    }

                    // remove internal/technical keys
                    const hide = new Set(['__v', 'business', 'isDeleted', 'updatedBy', 'createdBy', '_id']);
                    const finalKeysRaw = keys.filter(k => !hide.has(k));
                    // dedupe by display label to avoid repeated headers like Amount, Received, Balance
                    const seenLabels = new Set<string>();
                    const finalKeys: string[] = [];
                    for (const k of finalKeysRaw) {
                      const label = formatHeader(k);
                      if (seenLabels.has(label)) continue;
                      seenLabels.add(label);
                      finalKeys.push(k);
                    }

                    // if server provided fields metadata, use it
                    const serverFields: any[] | undefined = (typeof window !== 'undefined' && (window as any).__admin_new_sale_fields) ? (window as any).__admin_new_sale_fields : undefined;

                    // helper: comparator
                    const comparator = (k: string) => (a: any, b: any) => {
                      const va = a[k] ?? a.totalAmount ?? a.invoiceAmount ?? null;
                      const vb = b[k] ?? b.totalAmount ?? b.invoiceAmount ?? null;
                      // dates
                      if (k.toLowerCase().includes('date') || k.endsWith('At') || k.endsWith('at')) {
                        const da = va ? new Date(va).getTime() : 0;
                        const db = vb ? new Date(vb).getTime() : 0;
                        return (da || 0) - (db || 0);
                      }
                      // numeric-like
                      if (/amount|total|balance|price|received/i.test(k)) {
                        const na = Number(va ?? 0);
                        const nb = Number(vb ?? 0);
                        return na - nb;
                      }
                      // items (compare length)
                      if (k === 'items') {
                        const la = Array.isArray(va) ? va.length : 0;
                        const lb = Array.isArray(vb) ? vb.length : 0;
                        return la - lb;
                      }
                      // fallback string compare
                      const sa = va == null ? '' : String(va);
                      const sb = vb == null ? '' : String(vb);
                      return sa.localeCompare(sb);
                    };

                    // toggle sort
                    const toggleSort = (k: string) => {
                      if (sortKey !== k) {
                        setSortKey(k);
                        setSortOrder('desc');
                        return;
                      }
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    };

                    // render header (with sort buttons) -- prefer server field labels when available
                    const header = (
                      <TableRow>
                        {(serverFields && serverFields.length ? serverFields.map((f: any) => f.key) : finalKeys).map((k: string) => {
                          const label = serverFields && serverFields.length ? (serverFields.find((f: any) => f.key === k)?.label || formatHeader(k)) : formatHeader(k);
                          return (
                            <TableHead key={k} className={/amount|total|balance|price|received/i.test(k) ? 'text-right' : ''}>
                              <div className="flex items-center justify-between">
                                <button onClick={() => toggleSort(k)} className="flex items-center gap-2 text-left w-full">
                                  <span>{label}</span>
                                  <span className="text-xs text-gray-400">{sortKey === k ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>
                                </button>
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    );

                    // apply sorting if set
                    const sorted = (sortKey ? [...filtered].sort((a,b) => {
                      const cmp = comparator(sortKey)(a,b);
                      return sortOrder === 'asc' ? cmp : -cmp;
                    }) : filtered);

                    // render rows
                    const rows = sorted.map((s: any) => {
                      const keysToUse = serverFields && serverFields.length ? serverFields.map((f: any) => f.key) : finalKeys;
                      return (
                        <TableRow key={s._id || Math.random()} className="hover:bg-gray-50 align-top">
                          {keysToUse.map((k) => (
                            <TableCell key={k} className={/amount|total|balance|price|received/i.test(k) ? 'text-right' : ''}>
                              {renderCell(s, k, products)}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    });

                    return (
                      <>
                        {/* replace header placeholder */}
                        {loading ? null : header}
                        {rows}
                      </>
                    );
                  })()
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
