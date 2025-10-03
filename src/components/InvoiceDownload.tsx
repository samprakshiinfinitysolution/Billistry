"use client";

import React, { useEffect, useState, useRef } from 'react';

type InvoiceType = 'sale' | 'purchase' | 'sale-return' | 'purchase-return' | string;

interface Props {
  invoiceType: InvoiceType;
  invoiceId: string;
}

const amountToWords = (amount: number) => {
  // Basic converter for rupees and paise (supports up to crores in simple way)
  if (!isFinite(amount)) return '';
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);

  const ones: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const toWords = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
    if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
    return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
  };

  const sign = amount < 0 ? 'Minus ' : '';
  const rText = rupees === 0 ? 'Zero' : toWords(rupees) + ' Rupees';
  const pText = paise ? ' and ' + (paise < 20 ? ones[paise] : tens[Math.floor(paise / 10)] + (paise % 10 ? ' ' + ones[paise % 10] : '')) + ' Paise' : '';
  return sign + rText + pText + ' Only';
};

const mapTypeToEndpoint = (type: InvoiceType, id: string) => {
  const t = String(type).toLowerCase();
  if (t === 'sale' || t === 'new_sale') return `/api/new_sale/${id}`;
  if (t === 'purchase' || t === 'new_purchase') return `/api/new_purchase/${id}`;
  if (t === 'sale-return' || t === 'new_sale_return') return `/api/new_sale_return/${id}`;
  if (t === 'purchase-return' || t === 'new_purchase_return') return `/api/new_purchase_return/${id}`;
  // fallback: try as-is
  return `/${t}/${id}`;
};

export default function InvoiceDownload({ invoiceType, invoiceId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const url = mapTypeToEndpoint(invoiceType, invoiceId);
        let res = await fetch(url, { credentials: 'include' });
        let body = await res.json().catch(() => null);

        // If direct fetch by id didn't return, try querying by invoice number
        if ((!body || (body && !body._id && !(body.success && body.data))) && invoiceId) {
          // attempt query by invoice number
          const base = String(invoiceType).toLowerCase();
          const qType = base === 'sale' ? 'new_sale' : base === 'purchase' ? 'new_purchase' : base === 'sale-return' ? 'new_sale_return' : base === 'purchase-return' ? 'new_purchase_return' : base;
          const qUrl = `/api/${qType}?invoiceNo=${encodeURIComponent(invoiceId)}`;
          res = await fetch(qUrl, { credentials: 'include' });
          body = await res.json().catch(() => null);
          // if API returns array, pick first
          if (Array.isArray(body) && body.length) body = body[0];
          if (body && body.success && Array.isArray(body.data) && body.data.length) body = body.data[0];
        }

        if (!mounted) return;
        if (body && body.success && body.data) setData(body.data);
        else if (body && body._id) setData(body); // sometimes controller returns doc directly
        else setData(null);
      } catch (e) {
        console.error('Failed to fetch invoice', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchInvoice();
    return () => { mounted = false; };
  }, [invoiceType, invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // basic: open print dialog — user can select Save as PDF
    window.print();
  };

  const computeTotals = (items: any[] = []) => {
    let subtotal = 0;
    let totalTax = 0;
    for (const it of items) {
      const qty = Number(it.qty || 0);
      const price = Number(it.price || it.rate || 0);
      const discount = Number(it.discountAmountStr || 0) || 0;
      const tax = Number(it.taxAmountStr || 0) || 0;
      const line = qty * price - discount + tax;
      subtotal += qty * price - discount;
      totalTax += tax;
    }
    const total = subtotal + totalTax;
    return { subtotal, totalTax, total };
  };

  if (loading) return <div>Loading invoice...</div>;
  if (!data) return <div>No invoice found.</div>;

  const items: any[] = Array.isArray(data.items) ? data.items : [];
  const totals = computeTotals(items);
  const amountWords = amountToWords(Number(data.totalAmount || totals.total));

  const status = data.paymentStatus || (data.balanceAmount === 0 ? 'Refunded' : (data.amountRefunded || data.amountPaid) ? 'Partially Refunded' : 'Unpaid');

  return (
    <div ref={containerRef} className="bg-white p-6 rounded shadow max-w-4xl mx-auto text-sm text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">{(invoiceType || '').toString().replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} #{data.returnInvoiceNumber || data.invoiceNumber || ''}</h2>
          <div className="text-xs text-gray-600 mt-1">{data.returnInvoiceNo || data.invoiceNo || ''}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">{status}</span>
          <button onClick={handleDownload} className="px-3 py-1 bg-blue-600 text-white rounded">Download PDF</button>
          <button onClick={handlePrint} className="px-3 py-1 border rounded">Print</button>
        </div>
      </div>

      {/* Business & Party */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-semibold">{data.businessName || data.business?.name || 'Business Name'}</div>
          <div className="text-sm text-gray-600">{data.business?.mobileNumber || ''}</div>
        </div>
        <div>
          <div className="font-semibold">To: {data.selectedParty?.name || data.selectedParty?.partyName || data.partyName || ''}</div>
          <div className="text-sm text-gray-600">Mobile: {data.selectedParty?.mobileNumber || ''}</div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div><div className="text-gray-500">Return No.</div><div>{data.returnInvoiceNo || data.returnInvoiceNumber || '-'}</div></div>
        <div><div className="text-gray-500">Return Date</div><div>{data.returnDate ? new Date(data.returnDate).toLocaleDateString() : (data.savedAt ? new Date(data.savedAt).toLocaleDateString() : '')}</div></div>
        <div><div className="text-gray-500">Status</div><div>{status}</div></div>
      </div>

      {/* Items table */}
      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">S.No.</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Tax</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const qty = Number(it.qty || 0);
              const price = Number(it.price || it.rate || 0);
              const tax = Number(it.taxAmountStr || 0);
              const discount = Number(it.discountAmountStr || 0) || 0;
              const amount = qty * price - discount + tax;
              return (
                <tr key={idx} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{it.name}</td>
                  <td className="p-2 text-right">{qty}</td>
                  <td className="p-2 text-right">{price.toFixed(2)}</td>
                  <td className="p-2 text-right">{tax.toFixed(2)}</td>
                  <td className="p-2 text-right">{amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Payment */}
      <div className="flex justify-end mt-4">
        <div className="w-1/3">
          <div className="flex justify-between py-1"><div className="text-gray-600">Subtotal</div><div>₹ {totals.subtotal.toFixed(2)}</div></div>
          <div className="flex justify-between py-1"><div className="text-gray-600">Tax</div><div>₹ {totals.totalTax.toFixed(2)}</div></div>
          <div className="flex justify-between font-semibold py-1"><div>Total</div><div>₹ {Number(data.totalAmount || totals.total).toFixed(2)}</div></div>
          <div className="flex justify-between py-1"><div className="text-gray-600">Paid</div><div>₹ {Number(data.amountRefunded || data.amountPaid || 0).toFixed(2)}</div></div>
          <div className="flex justify-between py-1"><div className="text-gray-600">Balance</div><div>₹ {Number(data.balanceAmount || 0).toFixed(2)}</div></div>
        </div>
      </div>

      {/* Terms & Footer */}
      <div className="mt-6 text-sm">
        <div className="font-semibold">Terms & Conditions</div>
        <div className="text-gray-600 whitespace-pre-wrap">{data.terms || data.notes || 'Goods once sold will not be taken back or exchanged\nAll disputes are subject to city jurisdiction'}</div>
      </div>

      <div className="mt-6 flex justify-between items-end">
        <div>
          <div className="text-sm text-gray-600">Amount (in words)</div>
          <div className="font-semibold">{amountWords}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Authorized Signature</div>
          <div className="mt-8 h-12 w-40 border-b"></div>
        </div>
      </div>
    </div>
  );
}