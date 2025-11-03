import React from 'react';

type InvoiceType = 'sale' | 'purchase' | 'sale-return' | 'purchase-return' | string;

interface Props {
  invoiceType: InvoiceType;
  data: any;
}

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
  return rText + ' Rupees' + (paise ? ' and ' + paise + ' Paise' : '');
};

const parseRateValue = (v: any): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return isNaN(v) ? null : v;
  const s = String(v).trim();
  if (!s) return null;
  const cleaned = s.replace('%', '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
};

export default function InvoiceDownloadServer({ invoiceType, data }: Props) {
  const showGST = true;
  const showTax = true;
  const items: any[] = Array.isArray(data?.items) ? data.items : [];
  const subtotalNoTax = items.reduce((acc, it) => acc + (Number(it.qty || 0) * Number(it.price || it.rate || 0)), 0);
  const totalTax = items.reduce((acc, it) => acc + (parseFloat(it.taxAmountStr) || 0), 0);
  let cgstTotal = items.reduce((acc, it) => acc + (parseFloat(it.cgstAmountStr) || parseFloat(it.cgstAmount) || 0), 0);
  let sgstTotal = items.reduce((acc, it) => acc + (parseFloat(it.sgstAmountStr) || parseFloat(it.sgstAmount) || 0), 0);
  if (cgstTotal === 0 && sgstTotal === 0 && totalTax > 0) {
    cgstTotal = totalTax / 2;
    sgstTotal = totalTax / 2;
  }
  const totalItemDiscount = items.reduce((acc, it) => acc + (parseFloat(it.discountAmountStr) || parseFloat(it.discountAmount) || 0), 0);
  const overallDiscount = parseFloat(String(data?.discountFlatStr ?? data?.discountAmount ?? data?.discountAmountStr ?? 0)) || 0;
  const discountOption = data?.discountOption || data?.discountOptionStr || '';
  let taxableAmount = subtotalNoTax - totalItemDiscount;
  if ((discountOption === 'before-tax' || discountOption === 'beforeTax' || discountOption === '') && overallDiscount) {
    taxableAmount -= overallDiscount;
  }
  taxableAmount = Math.max(0, taxableAmount);
  const additionalCharges: { name?: string; amount?: any }[] = Array.isArray(data?.additionalCharges) ? data.additionalCharges : [];
  const totalAdditionalCharges = additionalCharges.reduce((acc, ch) => acc + (parseFloat(String(ch.amount || 0)) || 0), 0);

  const subtotalAfterItemDiscounts = subtotalNoTax - totalItemDiscount;
  const discountOpt = data?.discountOption || data?.discountOptionStr || '';
  const overallDisc = overallDiscount || 0;
  const totalTaxComputed = totalTax;
  const baseTotal = discountOpt === 'before-tax'
    ? (subtotalAfterItemDiscounts - overallDisc) + totalTaxComputed
    : (subtotalAfterItemDiscounts + totalTaxComputed) - overallDisc;
  const committedAdjustment = Number(data?.manualAdjustment || 0);
  const adjustmentTypeVal: 'add' | 'subtract' = data?.adjustmentType === 'subtract' ? 'subtract' : 'add';
  const adjustmentValue = adjustmentTypeVal === 'add' ? committedAdjustment : -committedAdjustment;
  const storedTotal = typeof data?.totalAmount !== 'undefined' ? Number(data.totalAmount) : NaN;
  let finalDisplayedTotal: number;
  if (!isNaN(storedTotal) && storedTotal > 0) {
    finalDisplayedTotal = data?.autoRoundOff ? Math.round(storedTotal) : storedTotal;
  } else {
    const computed = baseTotal + totalAdditionalCharges + adjustmentValue;
    finalDisplayedTotal = data?.autoRoundOff ? Math.round(computed) : computed;
  }
  const amountWords = amountToWords(finalDisplayedTotal);
  const totalItemDiscountVal = totalItemDiscount;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  // Build cgst/sgst by rate for footer display
  const cgstByRate: Record<string, number> = {};
  const sgstByRate: Record<string, number> = {};
  items.forEach(it => {
    const taxPercentRaw = it.taxPercentStr ?? it.taxPercent ?? null;
    const parsedTaxPercent = parseRateValue(taxPercentRaw);
    const explicitCgstRate = parseRateValue(it.cgstRate ?? it.cgst ?? null);
    const explicitSgstRate = parseRateValue(it.sgstRate ?? it.sgst ?? null);
    const cgstRate = (explicitCgstRate != null) ? explicitCgstRate : (parsedTaxPercent != null ? parsedTaxPercent / 2 : 0);
    const sgstRate = (explicitSgstRate != null) ? explicitSgstRate : (parsedTaxPercent != null ? parsedTaxPercent / 2 : 0);
    const cgstAmt = parseFloat(it.cgstAmountStr) || parseFloat(it.cgstAmount) || 0;
    const sgstAmt = parseFloat(it.sgstAmountStr) || parseFloat(it.sgstAmount) || 0;
    const taxAmt = parseFloat(it.taxAmountStr) || 0;
    const finalCgst = cgstAmt || (taxAmt ? taxAmt / 2 : 0);
    const finalSgst = sgstAmt || (taxAmt ? taxAmt / 2 : 0);
    cgstByRate[String(cgstRate)] = (cgstByRate[String(cgstRate)] || 0) + finalCgst;
    sgstByRate[String(sgstRate)] = (sgstByRate[String(sgstRate)] || 0) + finalSgst;
  });

  return (
    <div>
      <div className="invoice-print mx-auto bg-white text-black font-sans text-xs" style={{ width: '210mm', boxSizing: 'border-box' }}>
        <div className="p-6">
          <header className="grid grid-cols-2 items-start mb-3">
            <div className="flex items-center">
              {data?.business?.logoUrl && <img src={data.business.logoUrl} alt="logo" className="h-20 w-20 object-contain mr-4" />}
              <div>
                <h1 className="font-bold text-xl">{data?.business?.name}</h1>
                <p>Mobile: {data?.business?.mobileNumber}</p>
                {showGST && data?.business?.gstNumber && <p className="text-xs text-gray-600">GST: {data.business.gstNumber}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold text-lg">BILL OF SUPPLY</div>
              <div className="w-56">
                <div className="flex justify-between"><span>Invoice No.</span><span>: {data?.invoiceNo || data?.invoiceNumber || ''}</span></div>
                <div className="flex justify-between"><span>Invoice Date</span><span>: {data?.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString('en-GB') : ''}</span></div>
              </div>
            </div>
          </header>

          <div className="border-t border-b border-gray-300 py-1 mb-4">
            <div className="bg-gray-200 font-bold px-2 py-1 inline-block text-xs mb-1">BILL TO</div>
            <p className="font-semibold">{data?.selectedParty?.name || data?.partyName || 'Customer'}</p>
          </div>

          <div className="mb-1">
            <table className="w-full">
              <thead className="bg-gray-200 text-black">
               
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const qty = Number(it.qty || 0);
                  const price = Number(it.price || it.rate || 0);
                  const amount = qty * price;
                  return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-1 text-left">{idx + 1}</td>
                      <td className="p-1 text-left font-semibold">{it.name}</td>
                      <td className="p-1 text-center">{qty} {it.unit || 'PCS'}</td>
                      <td className="p-1 text-right">{price.toLocaleString('en-IN')}</td>
                      <td className="p-1 text-right">{(it.discountPercentStr || it.discountPercent) ? `${it.discountPercentStr || it.discountPercent}%` : '-'}</td>
                      {showTax && <td className="p-1 text-center">{it.taxPercentStr || it.taxPercent || ''}%</td>}
                      <td className="p-1 text-right">{(amount + (parseFloat(it.taxAmountStr) || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex bg-gray-200 text-black font-bold p-2">
            <div className="flex-1">SUBTOTAL</div>
            <div className="w-28 text-right">{formatCurrency(totalItemDiscountVal)}</div>
            {showTax && <div className="w-32 text-right">{formatCurrency(totalTax)}</div>}
            <div className="w-40 text-right">{formatCurrency(subtotalAfterItemDiscounts + (showTax ? totalTax : 0)).replace('.00','')}</div>
          </div>

          <div className="mt-6 grid grid-cols-2 items-start gap-12">
            <div>
              <h3 className="font-bold text-xs mb-1">TERMS AND CONDITIONS</h3>
              <p className="text-xs whitespace-pre-wrap">{data?.terms || '1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to jurisdiction only'}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="w-full max-w-xs">
                {additionalCharges.map((ch, i) => (
                  <div key={i} className="flex justify-between py-[2px] text-[11px]"><span>{ch.name || 'Charge'}</span><span>{formatCurrency(parseFloat(String(ch.amount || 0))).replace('.00','')}</span></div>
                ))}

                <div className="flex justify-between py-[2px] text-[11px]"><span>Taxable Amount</span><span>{formatCurrency(taxableAmount).replace('.00','')}</span></div>

                {showGST && (
                  <>
                    {Object.keys(cgstByRate).map((rateKey) => {
                      const rateNum = Number(rateKey) || 0;
                      const amt = cgstByRate[rateKey] || 0;
                      if (amt === 0) return null;
                      return (
                        <div key={'cgst-' + rateKey} className="flex justify-between py-[2px] text-[11px]"><span>CGST @{rateNum}%</span><span>{formatCurrency(amt).replace('.00','')}</span></div>
                      );
                    })}
                    {Object.keys(sgstByRate).map((rateKey) => {
                      const rateNum = Number(rateKey) || 0;
                      const amt = sgstByRate[rateKey] || 0;
                      if (amt === 0) return null;
                      return (
                        <div key={'sgst-' + rateKey} className="flex justify-between py-[2px] text-[11px]"><span>SGST @{rateNum}%</span><span>{formatCurrency(amt).replace('.00','')}</span></div>
                      );
                    })}
                  </>
                )}

                {overallDiscount > 0 && (
                  <div className="flex justify-between py-[2px] text-[11px]"><span>Discount</span><span>- {formatCurrency(overallDiscount).replace('.00','')}</span></div>
                )}

                <div className="border-t border-gray-300 mt-1" />
                <div className="flex justify-between border-y border-gray-300 py-1 font-bold text-sm"><span>Total Amount</span><span>{formatCurrency(finalDisplayedTotal).replace('.00','')}</span></div>
                <div className="border-b border-gray-300 mb-1" />
                <div className="flex justify-between py-[2px] text-[11px]"><span>Received Amount</span><span>{formatCurrency(Number(data?.amountReceived || data?.amountPaid || 0)).replace('.00','')}</span></div>
                <div className="text-left mt-1"><p className="font-bold text-xs mb-1">Total Amount (in words)</p><p className="text-[12px]">{amountWords}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}
