"use client";

import React, { useEffect, useState, useRef } from 'react';
import FormSkeleton from '@/components/ui/FormSkeleton';

type InvoiceType = 'sale' | 'purchase' | 'sale-return' | 'purchase-return' | string;

interface Props {
  invoiceType: InvoiceType;
  invoiceId: string;
}

// Helper function to convert amount to words
const amountToWords = (amount: number) => {
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

  const rText = rupees === 0 ? 'Zero' : toWords(rupees);
  // Matches "Thirty Thousand Four Hundred Rupees" format
  return rText + ' Rupees';
};

// Maps invoice type to its API endpoint
const mapTypeToEndpoint = (type: InvoiceType, id: string) => {
  const t = String(type).toLowerCase();
  if (t === 'sale' || t === 'new_sale') return `/api/new_sale/${id}`;
  if (t === 'purchase' || t === 'new_purchase') return `/api/new_purchase/${id}`;
  if (t === 'sale-return' || t === 'new_sale_return') return `/api/new_sale_return/${id}`;
  if (t === 'purchase-return' || t === 'new_purchase_return') return `/api/new_purchase_return/${id}`;
  return `/${t}/${id}`;
};

// Normalizes business data from various possible API response shapes
const normalizeBusinessData = (raw: any) => {
  if (!raw) return {};
  return {
    name: raw.name || raw.businessName || raw.business?.name || '',
    mobileNumber: raw.phone || raw.mobileNumber || raw.phoneNumber || raw.business?.mobileNumber || '',
    gstNumber: raw.gstNumber || raw.gstin || raw.business?.gstNumber || raw.business?.gstin || '',
    logoUrl: raw.logoUrl || raw.business?.logoUrl || '',
    signatureUrl: raw.signatureUrl || raw.business?.signatureUrl || '',
  };
};

export default function InvoiceDownload({ invoiceType, invoiceId }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGST, setShowGST] = useState<boolean>(true);
  const [showTax, setShowTax] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('invoiceSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        setShowGST(Boolean(parsed.showGST ?? true));
        setShowTax(Boolean(parsed.showTax ?? true));
      }
    } catch (e) {
      // ignore
    }

    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invoiceRes, settingsRes] = await Promise.all([
          fetch(mapTypeToEndpoint(invoiceType, invoiceId), { credentials: 'include' }).then(res => res.json()).catch(() => null),
          fetch('/api/business/settings', { credentials: 'include' }).then(res => res.json()).catch(() => null),
        ]);
        if (!mounted) return;
        let invoiceData = null;
        if (invoiceRes && invoiceRes.success && invoiceRes.data) invoiceData = invoiceRes.data;
        else if (invoiceRes && invoiceRes._id) invoiceData = invoiceRes;
        if (invoiceData) {
          const globalSettings = (settingsRes && settingsRes.success && settingsRes.data) ? normalizeBusinessData(settingsRes.data) : {};
          const embeddedBusinessInfo = normalizeBusinessData({ ...(invoiceData.business || {}), name: invoiceData.businessName, logoUrl: invoiceData.logoUrl, signatureUrl: invoiceData.signatureUrl, mobileNumber: invoiceData.phone });
          const finalBusinessData = { ...embeddedBusinessInfo, ...globalSettings };
          setData({ ...invoiceData, business: finalBusinessData });
        } else {
          setData(null);
        }
      } catch (e) {
        console.error('Failed to fetch invoice data', e);
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [invoiceType, invoiceId]);

  if (loading) return <div className="bg-gray-50 min-h-[400px]"><FormSkeleton /></div>;
  if (!data) return <div>No invoice found.</div>;

  const items: any[] = Array.isArray(data.items) ? data.items : [];
  const subtotalNoTax = items.reduce((acc, it) => acc + (Number(it.qty || 0) * Number(it.price || it.rate || 0)), 0);
  const totalTax = items.reduce((acc, it) => acc + (parseFloat(it.taxAmountStr) || 0), 0);
  // Prefer explicit CGST/SGST fields on items when available, otherwise split totalTax
  let cgstTotal = items.reduce((acc, it) => acc + (parseFloat(it.cgstAmountStr) || parseFloat(it.cgstAmount) || 0), 0);
  let sgstTotal = items.reduce((acc, it) => acc + (parseFloat(it.sgstAmountStr) || parseFloat(it.sgstAmount) || 0), 0);
  if (cgstTotal === 0 && sgstTotal === 0 && totalTax > 0) {
    // split equally when explicit CGST/SGST not present
    cgstTotal = totalTax / 2;
    sgstTotal = totalTax / 2;
  }
  // Discounts
  const totalItemDiscount = items.reduce((acc, it) => acc + (parseFloat(it.discountAmountStr) || parseFloat(it.discountAmount) || 0), 0);
  const overallDiscount = parseFloat(String(data.discountFlatStr ?? data.discountAmount ?? data.discountAmountStr ?? 0)) || 0;
  const discountOption = data.discountOption || data.discountOptionStr || '';
  // Taxable amount is subtotal minus item discounts minus any overall before-tax discount
  let taxableAmount = subtotalNoTax - totalItemDiscount;
  if ((discountOption === 'before-tax' || discountOption === 'beforeTax' || discountOption === '') && overallDiscount) {
    // default to applying overall discount before tax when option is missing
    taxableAmount -= overallDiscount;
  }
  taxableAmount = Math.max(0, taxableAmount);
  // Additional charges (example: Gourav charges)
  const additionalCharges: { name?: string; amount?: any }[] = Array.isArray(data.additionalCharges) ? data.additionalCharges : [];
  const totalAdditionalCharges = additionalCharges.reduce((acc, ch) => acc + (parseFloat(String(ch.amount || 0)) || 0), 0);
  // Helper to parse rates/percent strings like '5', '5%', 5, '0.5' into numeric percent (e.g. 5)
  const parseRateValue = (v: any): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return isNaN(v) ? null : v;
    const s = String(v).trim();
    if (!s) return null;
    const cleaned = s.replace('%', '').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  };

  // Aggregate CGST/SGST by rate for detailed lines
  const cgstByRate: Record<string, number> = {};
  const sgstByRate: Record<string, number> = {};
  items.forEach(it => {
    // Prefer explicit cgstRate/sgstRate, otherwise derive from cgst/cgst fields.
    // If those are absent but a combined taxPercent exists, use taxPercent/2 for each side so labels match split amounts.
    const taxPercentRaw = it.taxPercentStr ?? it.taxPercent ?? null;
    const parsedTaxPercent = parseRateValue(taxPercentRaw);

    const explicitCgstRate = parseRateValue(it.cgstRate ?? it.cgst ?? null);
    const explicitSgstRate = parseRateValue(it.sgstRate ?? it.sgst ?? null);

    const cgstRate = (explicitCgstRate != null) ? explicitCgstRate : (parsedTaxPercent != null ? parsedTaxPercent / 2 : 0);
    const sgstRate = (explicitSgstRate != null) ? explicitSgstRate : (parsedTaxPercent != null ? parsedTaxPercent / 2 : 0);

    // Prefer explicit cgst/sgst amounts when available; otherwise split taxAmount
    const cgstAmt = parseFloat(it.cgstAmountStr) || parseFloat(it.cgstAmount) || 0;
    const sgstAmt = parseFloat(it.sgstAmountStr) || parseFloat(it.sgstAmount) || 0;
    const taxAmt = parseFloat(it.taxAmountStr) || 0;
    const finalCgst = cgstAmt || (taxAmt ? taxAmt / 2 : 0);
    const finalSgst = sgstAmt || (taxAmt ? taxAmt / 2 : 0);

    const cKey = String(cgstRate);
    const sKey = String(sgstRate);
    cgstByRate[cKey] = (cgstByRate[cKey] || 0) + finalCgst;
    sgstByRate[sKey] = (sgstByRate[sKey] || 0) + finalSgst;
  });
  // Mirror the sales-invoice editor's logic for final total & balance calculation:
  // - subtotalNoTax: sum of qty * rate
  // - totalItemDiscount applied to get subtotalAfterItemDiscounts
  // - totalTax added when relevant
  // - overallDiscount may be applied before-tax or after-tax based on discountOption
  // - totalAdditionalCharges are always added
  // - manualAdjustment (data.manualAdjustment) added/subtracted based on adjustmentType
  // - autoRoundOff (data.autoRoundOff) controls rounding for final amount used in balance
  const subtotalAfterItemDiscounts = subtotalNoTax - totalItemDiscount;
  const discountOpt = data.discountOption || data.discountOptionStr || '';
  const overallDisc = overallDiscount || 0;
  // baseTotal mirrors editor's baseTotal calculation
  const baseTotal = discountOpt === 'before-tax'
    ? (subtotalAfterItemDiscounts - overallDisc) + totalTax
    : (subtotalAfterItemDiscounts + totalTax) - overallDisc;

  const committedAdjustment = Number(data.manualAdjustment || 0);
  const adjustmentTypeVal: 'add' | 'subtract' = data.adjustmentType === 'subtract' ? 'subtract' : 'add';
  const adjustmentValue = adjustmentTypeVal === 'add' ? committedAdjustment : -committedAdjustment;

  // Decide the final displayed total:
  // If server-provided data.totalAmount is present, treat that as the final total (editors save the final amount there),
  // otherwise compute from baseTotal + additional charges + adjustment. Apply autoRoundOff when appropriate.
  const storedTotal = typeof data.totalAmount !== 'undefined' ? Number(data.totalAmount) : NaN;
  let finalDisplayedTotal: number;
  if (!isNaN(storedTotal) && storedTotal > 0) {
    finalDisplayedTotal = data.autoRoundOff ? Math.round(storedTotal) : storedTotal;
  } else {
    const computed = baseTotal + totalAdditionalCharges + adjustmentValue;
    finalDisplayedTotal = data.autoRoundOff ? Math.round(computed) : computed;
  }

  const amountWords = amountToWords(finalDisplayedTotal);
  const totalQty = items.reduce((acc, it) => acc + Number(it.qty || 0), 0);
  const receivedAmount = Number(data.amountReceived || data.amountPaid || 0);
  const finalAmountForBalance = finalDisplayedTotal; // use same value for balance calculations and display
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  // Render full list on a single growing page (do not restrict to fixed A4 height)
  const rowsPerPage = Math.max(1, items.length); // set to full length so indexing still works
  const pages = [items];

  return (
    <>
      {/* Print-only CSS: hide everything except the invoice when printing */}
      <style>{`
        @media print {
          /* Hide all elements */
          body * { visibility: hidden !important; }
          /* Make invoice visible */
          .invoice-print, .invoice-print * { visibility: visible !important; }
          .invoice-print { position: absolute !important; left: 0; top: 0; width: 100% !important; }
          /* Page margins and size */
          @page { size: auto; margin: 10mm; }
          /* Avoid breaking inside table rows */
          table { page-break-inside: auto; }
          tr    { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
      {pages.map((pageItems, pageIndex) => {
        const isLast = pageIndex === pages.length - 1;
        return (
          <div key={pageIndex} ref={pageIndex === 0 ? containerRef : null} style={{ width: '210mm', boxSizing: 'border-box', pageBreakAfter: isLast ? 'auto' : 'always' }} className="invoice-print mx-auto bg-white text-black font-sans text-xs relative">
            {/* A4 inner padding and vertical layout (compact) */}
            <div className="h-full p-6 flex flex-col justify-between">
              <header className="grid grid-cols-2 items-start mb-3">
        {/* Left Side: Business Info */}
        <div className="flex items-center">
          {data.business?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.business.logoUrl} alt="Company Logo" className="h-20 w-20 object-contain mr-4" />
          )}
            <div>
              <h1 className="font-bold text-xl">{data.business?.name}</h1>
              <p>Mobile: {data.business?.mobileNumber}</p>
              {showGST && data.business?.gstNumber && <p className="text-xs text-gray-600">GST: {data.business?.gstNumber}</p>}
            </div>
        </div>
        {/* Right Side: Invoice Meta - context-aware */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3 mb-2">
            {/* Title depends on invoice type */}
            <div className="font-bold text-lg">
              {(() => {
                const t = String(invoiceType).toLowerCase();
                if (t === 'sale' || t === 'new_sale') return 'BILL OF SUPPLY';
                if (t === 'purchase' || t === 'new_purchase') return 'PURCHASE';
                if (t === 'sale-return' || t === 'new_sale_return') return 'SALES RETURN';
                if (t === 'purchase-return' || t === 'new_purchase_return') return 'PURCHASE RETURN';
                return 'INVOICE';
              })()}
            </div>
            <div className="border border-gray-500 px-3 py-1 text-xs">ORIGINAL FOR RECIPIENT</div>
          </div>
          <div className="w-56">
            {(() => {
              const t = String(invoiceType).toLowerCase();
              const isPurchase = (t === 'purchase' || t === 'new_purchase');
              const isSaleReturn = (t === 'sale-return' || t === 'new_sale_return');
              const isPurchaseReturn = (t === 'purchase-return' || t === 'new_purchase_return');
              const noLabel = isPurchase ? 'Purchase No.' : (isSaleReturn || isPurchaseReturn) ? 'Return No.' : 'Invoice No.';
              const dateLabel = isPurchase ? 'Purchase Date' : (isSaleReturn || isPurchaseReturn) ? 'Return Date' : 'Invoice Date';

              // Prefer return-specific fields for return invoices
              let invoiceNoValue = '';
              if (isSaleReturn || isPurchaseReturn) {
                if (data.returnInvoiceNo) invoiceNoValue = data.returnInvoiceNo;
                else if (data.returnInvoiceNumber) invoiceNoValue = String(data.returnInvoiceNumber);
                else invoiceNoValue = data.invoiceNo || '';
              } else {
                invoiceNoValue = data.invoiceNo || data.invoiceNumber || '';
              }

              let invoiceDateValue = '';
              if (isSaleReturn || isPurchaseReturn) {
                invoiceDateValue = data.returnDate || data.invoiceDate || data.savedAt || '';
              } else {
                invoiceDateValue = data.invoiceDate || data.returnDate || data.savedAt || '';
              }

              return (
                <>
                  <div className="flex justify-between">
                    <span>{noLabel}</span>
                    <span>: {invoiceNoValue || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dateLabel}</span>
                    <span>: {invoiceDateValue ? new Date(invoiceDateValue).toLocaleDateString('en-GB') : ''}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        </header>

        {/* Bill To / From / Party Section */}
        <div className="border-t border-b border-gray-300 py-1 mb-4">
        {(() => {
          const t = String(invoiceType).toLowerCase();
          const isPurchase = (t === 'purchase' || t === 'new_purchase');
          const isSaleReturn = (t === 'sale-return' || t === 'new_sale_return');
          const isPurchaseReturn = (t === 'purchase-return' || t === 'new_purchase_return');
          const label = isPurchase ? 'BILL FROM' : (isSaleReturn ? 'PARTY NAME' : (isPurchaseReturn ? 'PARTY NAME' : 'BILL TO'));
          return (
            <>
              <div className="bg-gray-200 font-bold px-2 py-1 inline-block text-xs mb-1">{label}</div>
              <p className="font-semibold">{data.selectedParty?.name || data.partyName || 'Customer'}</p>
            </>
          );
        })()}
      </div>

              {/* Items Table */}
              <div className="mb-1 flex-1 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-200 text-black">
                    <tr>
                      <th className="p-1 text-left font-bold w-12">S.NO.</th>
                      <th className="p-1 text-left font-bold">ITEMS</th>
                      <th className="p-1 text-center font-bold w-20">QTY.</th>
                      <th className="p-1 text-right font-bold w-24">RATE</th>
                      <th className="p-1 text-right font-bold w-24">DISCOUNT</th>
                      {showTax && <th className="p-1 text-center font-bold w-20">TAX</th>}
                      <th className="p-1 text-right font-bold w-32">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((it, idx) => {
                      const globalIdx = pageIndex * rowsPerPage + idx;
                      const qty = Number(it.qty || 0);
                      const price = Number(it.price || it.rate || 0);
                      const amount = qty * price;
                      return (
                        <tr key={globalIdx} className="border-b border-gray-200">
                          <td className="p-1 text-left">{globalIdx + 1}</td>
                          <td className="p-1 text-left font-semibold">{it.name}</td>
                          <td className="p-1 text-center">{qty} {it.unit || 'PCS'}</td>
                          <td className="p-1 text-right">{price.toLocaleString('en-IN')}</td>
                          <td className="p-1 text-right">
                            {(() => {
                              const percent = it.discountPercentStr ?? it.discountPercent ?? '';
                              const amountStr = it.discountAmountStr ?? it.discountAmount ?? '';
                              const amt = parseFloat(String(amountStr)) || 0;
                              return (
                                <>
                                  <div>{percent ? String(percent) + '%' : '-'}</div>
                                  <div className="text-[10px] text-gray-600">{formatCurrency(amt).replace('.00','')}</div>
                                </>
                              );
                            })()}
                          </td>
                          {showTax ? (
                            <td className="p-1 text-center">{(() => {
                              const tp = parseRateValue(it.taxPercentStr ?? it.taxPercent ?? it.taxPercent) ?? 0;
                              return String(tp).replace(/\.00$/,'');
                            })()}%<div className="text-[10px] text-gray-600">{formatCurrency(parseFloat(it.taxAmountStr) || 0).replace('.00','')}</div></td>
                          ) : null}
                          <td className="p-1 text-right">{( (amount + (showTax ? (parseFloat(it.taxAmountStr) || 0) : 0)) ).toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

  {/* Separator removed: previous design had a black band here */}

        {/* Subtotal Bar - show item discounts, tax and items grand total to match editor */}
          <div className="flex bg-gray-200 text-black font-bold p-2">
          <div className="flex-1">SUBTOTAL</div>
          <div className="w-28 text-right">{formatCurrency(totalItemDiscount)}</div>
          {showTax && <div className="w-32 text-right">{formatCurrency(totalTax)}</div>}
          <div className="w-40 text-right">{formatCurrency(subtotalAfterItemDiscounts + (showTax ? totalTax : 0)).replace('.00','')}</div>
        </div>

              {/* Footer Section - only render totals on last page */}
              {isLast ? (
                <footer className="mt-6 grid grid-cols-2 items-start gap-12">
        {/* Left side: Terms & Conditions */}
        <div>
          <h3 className="font-bold text-xs mb-1">TERMS AND CONDITIONS</h3>
          <p className="text-xs whitespace-pre-wrap">{data.terms || '1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only'}</p>
        </div>

        {/* Right side: Totals & Signature */}
        <div className="flex flex-col items-end">
          <div className="w-full max-w-xs">
            { /* Additional Charges */ }
            {additionalCharges.map((ch, i) => (
              <div key={i} className="flex justify-between py-[2px] text-[11px]">
                <span>{ch.name || 'Charge'}</span>
                <span>{formatCurrency(parseFloat(String(ch.amount || 0))).replace('.00','')}</span>
              </div>
            ))}

            <div className="flex justify-between py-[2px] text-[11px]">
              <span>Taxable Amount</span>
              <span>{formatCurrency(taxableAmount).replace('.00','')}</span>
            </div>

            {showGST && (
              <>
                {/* render CGST/SGST grouped by rate */}
                {Object.keys(cgstByRate).map((rateKey) => {
                  const rateNum = Number(rateKey) || 0;
                  const amt = cgstByRate[rateKey] || 0;
                  if (amt === 0) return null;
                  return (
                    <div key={'cgst-' + rateKey} className="flex justify-between py-[2px] text-[11px]">
                      <span>CGST @{rateNum}%</span>
                      <span>{formatCurrency(amt).replace('.00','')}</span>
                    </div>
                  );
                })}
                {Object.keys(sgstByRate).map((rateKey) => {
                  const rateNum = Number(rateKey) || 0;
                  const amt = sgstByRate[rateKey] || 0;
                  if (amt === 0) return null;
                  return (
                    <div key={'sgst-' + rateKey} className="flex justify-between py-[2px] text-[11px]">
                      <span>SGST @{rateNum}%</span>
                      <span>{formatCurrency(amt).replace('.00','')}</span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Discount (show for both before-tax and after-tax as a summary line) */}
            {overallDiscount > 0 && (
              <div className="flex justify-between py-[2px] text-[11px]">
                <span>Discount</span>
                <span>- {formatCurrency(overallDiscount).replace('.00','')}</span>
              </div>
            )}
            

            {/* Top border before Total Amount */}
            <div className="border-t border-gray-300 mt-1" />
            <div className="flex justify-between border-y border-gray-300 py-1 font-bold text-sm">
              <span>Total Amount</span>
              <span>{formatCurrency(finalAmountForBalance).replace('.00','')}</span>
            </div>
            {/* Bottom border after Total Amount */}
            <div className="border-b border-gray-300 mb-1" />
            <div className="flex justify-between py-[2px] text-[11px]">
              <span>Received Amount</span>
              <span>{formatCurrency(receivedAmount).replace('.00','')}</span>
            </div>
            {/* Balance removed per user request */}
            <div className="text-left mt-1">
              <p className="font-bold text-xs mb-1">Total Amount (in words)</p>
              <p className="text-[12px]">{amountWords}</p>
            </div>
          </div>
          
          {/* Boxed signature + business name (compact) */}
          <div className="mt-4 w-full flex justify-end items-end">
            <div className="w-full max-w-xs border border-gray-300 rounded p-2">
              <div className="flex flex-col items-end">
                {data.business?.signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.business.signatureUrl} alt="Signature" className="h-16 object-contain mb-1 inline-block" />
                ) : (
                  <div className="h-16 w-36 mb-1" /> // Placeholder for spacing
                )}
                <div className="border-t border-gray-200 pt-1 mt-1 text-right text-sm">
                  <div className="font-semibold">{data.business?.name}</div>
                  <div className="text-xs">Authorised Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
                </footer>
              ) : (
                // keep smaller space for footer on non-last pages so layout is consistent
                <div style={{ minHeight: '80px' }} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}