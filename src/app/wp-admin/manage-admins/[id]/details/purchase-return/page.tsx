"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import TableSkeleton from '@/components/ui/TableSkeleton';

export default function PurchaseReturnPage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [fields, setFields] = useState<any[] | undefined>(undefined);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [supplierSelect, setSupplierSelect] = useState<string>('all');
  const [productSelect, setProductSelect] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatHeader = (k: string) => {
    if (!k) return '';
    const map: Record<string, string> = {
      returnNo: 'Return No',
      returnDate: 'Date',
      createdAt: 'Date',
      invoiceRef: 'Bill Ref',
      items: 'Items',
      refundAmount: 'Refund',
      totalRefund: 'Refund'
    };
    if (map[k]) return map[k];
    return k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase());
  };

  const renderCell = (row: any, k: string, productsList: any[]) => {
    const v = row[k];
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

    if (k.toLowerCase().includes('date') || k.endsWith('At') || k.endsWith('at')) {
      const dateStr = v || row['returnDate'] || row['createdAt'];
      if (!dateStr) return '—';
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return '—';
      const datePart = dt.toLocaleDateString();
      const timePart = dt.toLocaleTimeString();
      return (
        <div>
          <div>{datePart}</div>
          <div className="text-xs text-gray-500">{timePart}</div>
        </div>
      );
    }

    if (/amount|refund|total|balance|price|received/i.test(k)) {
      const num = Number(v ?? row.refundAmount ?? row.totalRefund ?? 0);
      return `₹ ${num.toLocaleString()}`;
    }

    if ((k === 'supplier' || k === 'selectedSupplier' || k === 'selectedParty' || k === 'party') && v && typeof v === 'object') {
      const sup: any = v;
      const name = sup.name || sup.partyName || sup.supplierName || sup.displayName || '—';
      const phone = sup.mobileNumber || sup.phone || sup.contact || '';
      const gst = sup.gstin || sup.taxNumber || '';
      const billing = sup.billingAddress || sup.address || sup.billing || '';
      const shipping = sup.shippingAddress || sup.shipping || '';
      const balance = sup.balance ?? sup.openingBalance ?? sup.currentBalance ?? null;
      return (
        <div className="text-sm text-gray-700">
          <div className="font-medium">{name}</div>
          {phone ? <div className="text-xs text-gray-500">{phone}</div> : null}
          {gst ? <div className="text-xs text-gray-500">GST: {gst}</div> : null}
          {billing ? <div className="text-xs text-gray-500">Billing: {billing}</div> : null}
          {shipping ? <div className="text-xs text-gray-500">Shipping: {shipping}</div> : null}
          {balance != null ? <div className="text-xs text-gray-700 mt-1">Balance: <span className="font-medium">₹ {Number(balance).toLocaleString()}</span></div> : null}
        </div>
      );
    }

    if (v == null) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/new_purchase_return?businessId=${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) {
          console.error('failed to fetch purchase returns', await res.text());
          if (mounted) setReturnsList([]);
          return;
        }
        const json = await res.json();
        const list = json?.data || [];
        if (mounted) {
          setReturnsList(list);
          try { if (json?.fields && Array.isArray(json.fields)) setFields(json.fields); } catch (e) {}
        }
      } catch (err) {
        console.error('error fetching purchase returns', err);
        if (mounted) setReturnsList([]);
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
          console.warn('failed to fetch products for purchase return details', await res.text());
          if (mounted) setProducts([]);
          return;
        }
        const json = await res.json();
        const list = json?.products || [];
        if (mounted) setProducts(list);
      } catch (e) {
        console.warn('error loading products for purchase return details', e);
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
          <div className="text-sm text-gray-500">Purchase Returns</div>
          <div className="text-2xl font-semibold">{returnsList.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Refunds</div>
          <div className="text-2xl font-semibold">₹ {returnsList.reduce((s, r) => s + (Number(r.refundAmount || r.totalRefund || 0) || 0), 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Avg Return</div>
          <div className="text-2xl font-semibold">₹ {returnsList.length ? Math.round(returnsList.reduce((s, r) => s + (Number(r.refundAmount || r.totalRefund || 0) || 0), 0) / returnsList.length) : 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Purchase Return</h3>
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
              <label className="text-xs text-gray-500">Supplier</label>
              <select value={supplierSelect} onChange={e => setSupplierSelect(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1">
                <option value="all">All</option>
                {Array.from(new Set(returnsList.map(s => ((s.supplier && (s.supplier.name || s.supplier.partyName)) || s.supplierName || '').trim()).filter(Boolean))).map(p => (
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
              <input placeholder="Search return, supplier, product..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
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
            <button onClick={() => { setStartDate(''); setEndDate(''); setSupplierSelect('all'); setPaymentStatusFilter('all'); setMinAmount(''); setMaxAmount(''); setProductSelect('all'); setSearchQuery(''); }} className="px-3 py-1 bg-gray-100 rounded">Clear</button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Dynamic columns */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <TableSkeleton rows={3} />
                    </TableCell>
                  </TableRow>
                ) : returnsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-4 text-center text-sm text-gray-500">No returns found</TableCell>
                  </TableRow>
                ) : null}

                {(() => {
                  const applyFilters = (arr: any[]) => arr.filter((s: any) => {
                    const amount = Number(s.refundAmount || s.totalRefund || 0);
                    const dateStr = s.returnDate || s.createdAt;
                    const date = dateStr ? new Date(dateStr) : null;
                    if (startDate && date) {
                      const sd = new Date(startDate + 'T00:00:00'); if (date < sd) return false;
                    }
                    if (endDate && date) {
                      const ed = new Date(endDate + 'T23:59:59'); if (date > ed) return false;
                    }
                    if (supplierSelect && supplierSelect !== 'all') {
                      const name = ((s.supplier && (s.supplier.name || s.supplier.partyName)) || s.supplierName || '').trim(); if (name !== supplierSelect) return false;
                    }
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      const refHit = (s.returnNo || s._id || '').toString().toLowerCase().includes(q);
                      const supHit = (((s.supplier && (s.supplier.name || s.supplier.partyName)) || s.supplierName || '') + '').toLowerCase().includes(q);
                      const itemsHit = Array.isArray(s.items) && s.items.some((it: any) => (it.name || it.productName || (it._product && it._product.name) || '').toString().toLowerCase().includes(q));
                      if (!(refHit || supHit || itemsHit)) return false;
                    }
                    if (paymentStatusFilter && paymentStatusFilter !== 'all') {
                      let statusRaw = (s.paymentStatus || s.payment_status || s.paymentMode || s.payment_mode || '').toString().toLowerCase();
                      const paidModes = new Set(['paid','cash','upi','card','netbanking','bank','bank_transfer','bank-transfer','cheque','online']);
                      let inferredStatus: 'paid'|'partial'|'unpaid' = 'unpaid';
                      const amountTotal = Number(s.refundAmount || s.totalRefund || 0);
                      const amountReceived = Number(s.amountReceived || s.receivedAmount || s.amount || 0);
                      if (statusRaw && paidModes.has(statusRaw)) inferredStatus = 'paid';
                      else if (statusRaw === 'paid' || statusRaw === 'paid_full' || statusRaw === 'full') inferredStatus = 'paid';
                      else if (statusRaw === 'partial' || statusRaw === 'partially_paid') inferredStatus = 'partial';
                      else if (statusRaw === 'unpaid' || statusRaw === 'due') inferredStatus = 'unpaid';
                      else { if (amountTotal > 0 && amountReceived >= amountTotal) inferredStatus = 'paid'; else if (amountReceived > 0 && amountReceived < amountTotal) inferredStatus = 'partial'; else inferredStatus = 'unpaid'; }
                      if (paymentStatusFilter === 'paid' && inferredStatus !== 'paid') return false;
                      if (paymentStatusFilter === 'partial' && inferredStatus !== 'partial') return false;
                      if (paymentStatusFilter === 'unpaid' && inferredStatus !== 'unpaid') return false;
                    }
                    if (minAmount) { if (amount < Number(minAmount)) return false; }
                    if (maxAmount) { if (amount > Number(maxAmount)) return false; }
                    if (productSelect && productSelect !== 'all') { const has = Array.isArray(s.items) && s.items.some((it: any) => String(it.productId || it.product || it._product?._id) === String(productSelect)); if (!has) return false; }
                    return true;
                  });

                  const filtered = applyFilters(returnsList || []);
                  const seen = new Set<string>(); const keys: string[] = [];
                  const pushIf = (k?: string) => { if (k && !seen.has(k)) { seen.add(k); keys.push(k); } };
                  pushIf('returnNo'); pushIf('returnDate'); pushIf('createdAt'); pushIf('invoiceRef'); pushIf('items'); pushIf('refundAmount'); pushIf('totalRefund');
                  for (const s of filtered) { if (!s || typeof s !== 'object') continue; for (const k of Object.keys(s)) pushIf(k); }
                  const hide = new Set(['__v','business','isDeleted','updatedBy','createdBy','_id']);
                  const finalKeysRaw = keys.filter(k => !hide.has(k));
                  const seenLabels = new Set<string>(); const finalKeys: string[] = [];
                  for (const k of finalKeysRaw) { const label = formatHeader(k); if (seenLabels.has(label)) continue; seenLabels.add(label); finalKeys.push(k); }

                  const serverFields: any[] | undefined = fields;

                  const comparator = (k: string) => (a: any, b: any) => {
                    const va = a[k] ?? a.refundAmount ?? a.totalRefund ?? null; const vb = b[k] ?? b.refundAmount ?? b.totalRefund ?? null;
                    if (k.toLowerCase().includes('date') || k.endsWith('At') || k.endsWith('at')) { const da = va ? new Date(va).getTime() : 0; const db = vb ? new Date(vb).getTime() : 0; return (da||0)-(db||0); }
                    if (/amount|refund|total|balance|price|received/i.test(k)) { const na = Number(va??0); const nb = Number(vb??0); return na-nb; }
                    if (k === 'items') { const la = Array.isArray(va)?va.length:0; const lb = Array.isArray(vb)?vb.length:0; return la-lb; }
                    const sa = va==null? '': String(va); const sb = vb==null? '': String(vb); return sa.localeCompare(sb);
                  };

                  const toggleSort = (k: string) => { if (sortKey !== k) { setSortKey(k); setSortOrder('desc'); return; } setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); };

                  const header = (
                    <TableRow>
                      {(serverFields && serverFields.length ? serverFields.map((f: any) => f.key) : finalKeys).map((k: string) => {
                        const label = serverFields && serverFields.length ? (serverFields.find((f: any) => f.key === k)?.label || formatHeader(k)) : formatHeader(k);
                        return (
                          <TableHead key={k} className={/refund|amount|total|balance|price|received/i.test(k) ? 'text-right' : ''}>
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

                  const sorted = (sortKey ? [...filtered].sort((a,b) => { const cmp = comparator(sortKey)(a,b); return sortOrder === 'asc' ? cmp : -cmp; }) : filtered);

                  const rows = sorted.map((s: any) => {
                    const keysToUse = serverFields && serverFields.length ? serverFields.map((f: any) => f.key) : finalKeys;
                    return (
                      <TableRow key={s._id || Math.random()} className="hover:bg-gray-50 align-top">
                        {keysToUse.map((k) => (
                          <TableCell key={k} className={/refund|amount|total|balance|price|received/i.test(k) ? 'text-right' : ''}>
                            {renderCell(s, k, products)}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  });

                  return (<>{loading ? null : header}{rows}</>);
                })()}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
