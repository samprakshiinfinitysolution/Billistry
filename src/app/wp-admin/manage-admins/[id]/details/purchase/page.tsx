"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function PurchasePage() {
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [purchases, setPurchases] = useState<any[]>([]);
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
      invoiceNo: 'Bill No',
      invoiceNumber: 'Bill No',
      invoiceDate: 'Date',
      createdAt: 'Date',
      supplier: 'Supplier',
      supplierName: 'Supplier',
      items: 'Items',
      totalAmount: 'Amount',
      invoiceAmount: 'Amount',
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
      const dateStr = v || row['invoiceDate'] || row['createdAt'];
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

    if (/amount|total|balance|price|received/i.test(k)) {
      const num = Number(v ?? row.totalAmount ?? row.invoiceAmount ?? 0);
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

    if (v == null) return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/new_purchase?businessId=${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!res.ok) {
          console.error('failed to fetch purchases', await res.text());
          setPurchases([]);
          return;
        }
        const json = await res.json();
        const list = json?.data || [];
        if (mounted) {
          setPurchases(list);
          try { if (json?.fields && Array.isArray(json.fields)) setFields(json.fields); } catch (e) {}
        }
      } catch (err) {
        console.error('error fetching purchases', err);
        if (mounted) setPurchases([]);
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
          console.warn('failed to fetch products for purchase details', await res.text());
          if (mounted) setProducts([]);
          return;
        }
        const json = await res.json();
        const list = json?.products || [];
        if (mounted) setProducts(list);
      } catch (e) {
        console.warn('error loading products for purchase details', e);
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
          <div className="text-sm text-gray-500">Total Purchases</div>
          <div className="text-2xl font-semibold">₹ {purchases.reduce((s, a) => s + (Number(a.totalAmount || a.invoiceAmount || 0) || 0), 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Bills</div>
          <div className="text-2xl font-semibold">{purchases.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500">Avg Bill</div>
          <div className="text-2xl font-semibold">₹ {purchases.length ? Math.round((purchases.reduce((s, a) => s + (Number(a.totalAmount || a.invoiceAmount || 0) || 0), 0) || 0) / purchases.length) : 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Purchase</h3>
        </div>
        <div>
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-2">
            <div>
              <label className="text-xs text-gray-500">From</label>
              <Input type="date" value={startDate} onChange={e => setStartDate((e.target as HTMLInputElement).value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">To</label>
              <Input type="date" value={endDate} onChange={e => setEndDate((e.target as HTMLInputElement).value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Supplier</label>
              <Select value={supplierSelect} onValueChange={(v) => setSupplierSelect(v)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Array.from(new Set(purchases.map(s => ((s.supplier && (s.supplier.name || s.supplier.partyName)) || s.supplierName || '').trim()).filter(Boolean))).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Product</label>
              <Select value={productSelect} onValueChange={(v) => setProductSelect(v)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {products.map((p: any) => (
                    <SelectItem key={p._id} value={String(p._id)}>{p.name || p.title || p.productName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Search</label>
              <Input placeholder="Search bill, supplier, product..." value={searchQuery} onChange={e => setSearchQuery((e.target as HTMLInputElement).value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Status</label>
              <Select value={paymentStatusFilter} onValueChange={(v) => setPaymentStatusFilter(v)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Min Amount</label>
              <Input type="number" placeholder="Min" value={minAmount} onChange={e => setMinAmount((e.target as HTMLInputElement).value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Max Amount</label>
              <Input type="number" placeholder="Max" value={maxAmount} onChange={e => setMaxAmount((e.target as HTMLInputElement).value)} className="mt-1" />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); setSupplierSelect('all'); setPaymentStatusFilter('all'); setMinAmount(''); setMaxAmount(''); setProductSelect('all'); setSearchQuery(''); }}>Clear</Button>
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
                ) : purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-4 text-center text-sm text-gray-500">No purchases found</TableCell>
                  </TableRow>
                ) : null}
                {(() => {
                  const applyFilters = (arr: any[]) => arr.filter((s: any) => {
                    const amount = Number(s.totalAmount || s.invoiceAmount || 0);
                    const dateStr = s.invoiceDate || s.createdAt;
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
                      const billHit = (s.invoiceNo || s.invoiceNumber || '').toString().toLowerCase().includes(q);
                      const supHit = (((s.supplier && (s.supplier.name || s.supplier.partyName)) || s.supplierName || '') + '').toLowerCase().includes(q);
                      const itemsHit = Array.isArray(s.items) && s.items.some((it: any) => (it.name || it.productName || (it._product && it._product.name) || '').toString().toLowerCase().includes(q));
                      if (!(billHit || supHit || itemsHit)) return false;
                    }
                    if (paymentStatusFilter && paymentStatusFilter !== 'all') {
                      let statusRaw = (s.paymentStatus || s.payment_status || s.paymentMode || s.payment_mode || '').toString().toLowerCase();
                      const paidModes = new Set(['paid','cash','upi','card','netbanking','bank','bank_transfer','bank-transfer','cheque','online']);
                      let inferredStatus: 'paid'|'partial'|'unpaid' = 'unpaid';
                      const amountTotal = Number(s.totalAmount || s.invoiceAmount || 0);
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

                  const filtered = applyFilters(purchases || []);
                  const seen = new Set<string>(); const keys: string[] = [];
                  const pushIf = (k?: string) => { if (k && !seen.has(k)) { seen.add(k); keys.push(k); } };
                  pushIf('invoiceNo'); pushIf('invoiceNumber'); pushIf('invoiceDate'); pushIf('createdAt'); pushIf('supplier'); pushIf('supplierName'); pushIf('items'); pushIf('totalAmount'); pushIf('invoiceAmount');
                  for (const s of filtered) { if (!s || typeof s !== 'object') continue; for (const k of Object.keys(s)) pushIf(k); }
                  const hide = new Set(['__v','business','isDeleted','updatedBy','createdBy','_id']);
                  const finalKeysRaw = keys.filter(k => !hide.has(k));
                  const seenLabels = new Set<string>(); const finalKeys: string[] = [];
                  for (const k of finalKeysRaw) { const label = formatHeader(k); if (seenLabels.has(label)) continue; seenLabels.add(label); finalKeys.push(k); }

                  const serverFields: any[] | undefined = fields;

                  const comparator = (k: string) => (a: any, b: any) => {
                    const va = a[k] ?? a.totalAmount ?? a.invoiceAmount ?? null; const vb = b[k] ?? b.totalAmount ?? b.invoiceAmount ?? null;
                    if (k.toLowerCase().includes('date') || k.endsWith('At') || k.endsWith('at')) { const da = va ? new Date(va).getTime() : 0; const db = vb ? new Date(vb).getTime() : 0; return (da||0)-(db||0); }
                    if (/amount|total|balance|price|received/i.test(k)) { const na = Number(va??0); const nb = Number(vb??0); return na-nb; }
                    if (k === 'items') { const la = Array.isArray(va)?va.length:0; const lb = Array.isArray(vb)?vb.length:0; return la-lb; }
                    const sa = va==null? '': String(va); const sb = vb==null? '': String(vb); return sa.localeCompare(sb);
                  };

                  const toggleSort = (k: string) => { if (sortKey !== k) { setSortKey(k); setSortOrder('desc'); return; } setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); };

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

                  const sorted = (sortKey ? [...filtered].sort((a,b) => { const cmp = comparator(sortKey)(a,b); return sortOrder === 'asc' ? cmp : -cmp; }) : filtered);

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
