"use client";

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
// We'll prefer html2pdf (html2canvas + jsPDF) to capture the invoice DOM and
// produce a PDF that matches the HTML/CSS. Keep jspdf imports for fallback.
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceDownload from '@/components/InvoiceDownload';

const SalesReturnInvoiceViewer = ({ params }: { params: any }) => {
    const router = useRouter();
    // Try to unwrap params using React.use() when available; otherwise resolve the promise in an effect
 
    const maybeParams = (React as any).use ? (React as any).use(params) : undefined;
    const initialId = maybeParams?.id ?? null;
    const [id, setId] = useState<string | null>(initialId);
    const [meta, setMeta] = useState<any>(null);
    const [isMetaLoading, setIsMetaLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
    const fetchMeta = async () => {
            setIsMetaLoading(true);
            try {
        const safeId = String(id);
        let res = await fetch(`/api/new_sale_return/${encodeURIComponent(safeId)}`, { credentials: 'include' });
                let body = await res.json().catch(() => null);

                // If direct fetch by id didn't return a doc, try querying by invoice number
                if ((!body || (body && !body._id && !(body.success && body.data))) && id) {
                    const qUrl = `/api/new_sale_return?invoiceNo=${encodeURIComponent(id)}`;
                    res = await fetch(qUrl, { credentials: 'include' });
                    body = await res.json().catch(() => null);
                    if (Array.isArray(body) && body.length) body = body[0];
                    if (body && body.success && Array.isArray(body.data) && body.data.length) body = body.data[0];
                }

                if (!mounted) return;
                if (body && body.success && body.data) setMeta(body.data);
                else if (body && body._id) setMeta(body);
                else setMeta(null);
            } catch (e) {
                if (mounted) setMeta(null);
            } finally {
                if (mounted) setIsMetaLoading(false);
            }
        };
        if (id) fetchMeta();
        return () => { mounted = false; };
    }, [id]);

    useEffect(() => {
        if (id) return;
        let mounted = true;
        (async () => {
            try {
                const resolved = await params;
                if (!mounted) return;
                if (resolved?.id) setId(resolved.id);
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [params, id]);

    const handlePrint = () => window.print();
    const exportReturnPDF = async (invoiceMeta: any) => {
        const partyName = invoiceMeta?.selectedParty?.name || invoiceMeta?.partyName || 'Sales_Return';
        const filename = `${String(partyName).replace(/\s+/g,'_')}_Sales_Return.pdf`;

        // Find the printable invoice element rendered by InvoiceDownload
        const el = document.querySelector('.invoice-print') as HTMLElement | null;
        if (!el) {
            // If the element is not available (rare), fall back to the old jsPDF method
            try {
                const doc = new jsPDF({ unit: 'pt', format: 'a4' });
                const inv = invoiceMeta;
                doc.setFontSize(14);
                doc.text(inv?.businessName || 'Company', 40, 40);
                doc.setFontSize(11);
                doc.text(`Return: ${inv?.returnInvoiceNumber || inv?.returnInvoiceNo || id || ''}`, 40, 60);
                const body = (inv?.items || []).map((it: any, idx: number) => {
                    const qty = it.quantity ?? it.qty ?? 0;
                    const rate = it.rate ?? it.price ?? 0;
                    const amt = qty * rate;
                    return [String(idx + 1), it.name || it.itemName || '', String(qty), Number(rate).toFixed(2), Number(amt).toFixed(2)];
                });
                autoTable(doc, { startY: 110, head: [['#', 'Item', 'Qty', 'Rate', 'Amount']], body, styles: { fontSize: 10 } });
                doc.save(filename);
            } catch (e) {
                console.error('PDF export fallback failed', e);
                alert('Failed to generate PDF');
            }
            return;
        }

        try {
            // Try dynamic import first
            let html2pdf: any = null;
            try {
                // some bundlers export default, some attach to module - try both
                // @ts-ignore
                const mod = await import('html2pdf.js');
                html2pdf = (mod && (mod.default || mod));
            } catch (e) {
                // ignore - try window fallback
            }

            if (!html2pdf && (window as any).html2pdf) html2pdf = (window as any).html2pdf;
            if (!html2pdf) {
                console.warn('html2pdf not available, falling back to jsPDF table export');
                // fallback to jsPDF
                const doc = new jsPDF({ unit: 'pt', format: 'a4' });
                const inv = invoiceMeta;
                doc.setFontSize(14);
                doc.text(inv?.businessName || 'Company', 40, 40);
                doc.setFontSize(11);
                doc.text(`Return: ${inv?.returnInvoiceNumber || inv?.returnInvoiceNo || id || ''}`, 40, 60);
                const body = (inv?.items || []).map((it: any, idx: number) => {
                    const qty = it.quantity ?? it.qty ?? 0;
                    const rate = it.rate ?? it.price ?? 0;
                    const amt = qty * rate;
                    return [String(idx + 1), it.name || it.itemName || '', String(qty), Number(rate).toFixed(2), Number(amt).toFixed(2)];
                });
                autoTable(doc, { startY: 110, head: [['#', 'Item', 'Qty', 'Rate', 'Amount']], body, styles: { fontSize: 10 } });
                doc.save(filename);
                return;
            }

            // Ensure element is fully rendered and images/fonts loaded
            const waitForImages = async (root: HTMLElement) => {
                const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
                await Promise.all(imgs.map(img => new Promise<void>(resolve => {
                    if (!img || img.complete) return resolve();
                    img.addEventListener('load', () => resolve());
                    img.addEventListener('error', () => resolve());
                })));
            };
            await waitForImages(el);

            // Clone the invoice node and inline computed styles. This resolves modern CSS
            // color functions (like oklch) into computed values (rgb/rgba) so html2canvas
            // does not attempt to parse unsupported color functions.
            const cloneWithInlineStyles = (source: HTMLElement): HTMLElement => {
                const clone = source.cloneNode(true) as HTMLElement;
                const srcNodes = [source, ...Array.from(source.querySelectorAll('*'))] as HTMLElement[];
                const cloneNodes = [clone, ...Array.from(clone.querySelectorAll('*'))] as HTMLElement[];

                const propsToCopy = [
                    'display','color','background-color','background','background-image','background-size','background-position','background-repeat',
                    'border','border-top','border-right','border-bottom','border-left','border-color','border-radius','box-shadow',
                    'font-family','font-size','font-weight','line-height','text-align','vertical-align','letter-spacing',
                    'padding','padding-top','padding-right','padding-bottom','padding-left','margin','width','height','min-width','max-width',
                    'min-height','max-height','overflow','white-space'
                ];

                // regex to find CSS color functions that html2canvas may not support directly
                const colorFuncRegexGlobal = /(oklab|oklch|lab|lch|color)\([^)]*\)/gi;

                const tryResolve = (token: string, prop: string) => {
                    try {
                        const t = document.createElement('span');
                        t.style.position = 'fixed';
                        t.style.left = '-9999px';
                        t.style.top = '0';
                        // clear any previous values
                        (t.style as any)[prop] = '';
                        (t.style as any)[prop] = token;
                        document.body.appendChild(t);
                        const cs = window.getComputedStyle(t);
                        // prefer color-like computed values
                        const resolved = (prop === 'background' || prop === 'backgroundColor') ? cs.backgroundColor || cs.color : cs.color || cs.backgroundColor;
                        t.remove();
                        return resolved;
                    } catch (e) {
                        return null;
                    }
                };

                const resolveColorToken = (token: string) => {
                    // Try multiple properties because some modern color functions are only
                    // accepted in certain contexts (background vs color). Try color first,
                    // then background, backgroundColor and borderColor.
                    const props = ['color', 'background', 'backgroundColor', 'borderColor'];
                    for (const p of props) {
                        const r = tryResolve(token, p);
                        if (r && r !== token && r !== 'rgba(0, 0, 0, 0)' && r !== 'transparent') return r;
                    }
                    return token;
                };

                const replaceColorFunctions = (val: string) => {
                    if (!val || typeof val !== 'string') return val;
                    // replace each color-function occurrence with a resolved rgb/rgba value
                    return val.replace(colorFuncRegexGlobal, (m) => {
                        try { return resolveColorToken(m); } catch (e) { return m; }
                    });
                };

                for (let i = 0; i < srcNodes.length; i++) {
                    const s = srcNodes[i];
                    const c = cloneNodes[i];
                    if (!s || !c) continue;
                    try {
                        const cs = window.getComputedStyle(s);
                        // apply each property as an inline style on the clone, but handle
                        // color/background specially by using computed color values which
                        // are already resolved to rgb/rgba in most browsers.
                        propsToCopy.forEach(p => {
                            try {
                                // handle color properties with resolved computed values
                                if (p === 'color') {
                                    const v = cs.color;
                                    if (v) c.style.setProperty('color', v);
                                    return;
                                }
                                if (p === 'background-color' || p === 'background') {
                                    // prefer backgroundColor which is computed as rgb/rgba
                                    const v = cs.backgroundColor || cs.getPropertyValue('background');
                                    if (v) c.style.setProperty('background-color', v);
                                    return;
                                }
                                if (p === 'border-color') {
                                    const v = cs.borderColor || cs.getPropertyValue('border-color');
                                    if (v) c.style.setProperty('border-color', v);
                                    return;
                                }
                                if (p === 'box-shadow') {
                                    const v = cs.getPropertyValue('box-shadow');
                                    if (!v) return;
                                    const safe = replaceColorFunctions(v.trim());
                                    // if after replacement there's still an oklch token, drop the box-shadow
                                    if (/oklch|oklab|lab|lch/gi.test(safe)) return;
                                    c.style.setProperty('box-shadow', safe);
                                    return;
                                }

                                const v = cs.getPropertyValue(p);
                                if (!v) return;
                                const safe = replaceColorFunctions(v.trim());
                                if (safe) c.style.setProperty(p, safe);
                            } catch (e) { /* ignore individual property errors */ }
                        });
                        // copy width/height as computed px values to preserve layout
                        try { const w = cs.width; if (w) c.style.setProperty('width', w); } catch (e) { /* ignore */ }
                        try { const h = cs.height; if (h) c.style.setProperty('height', h); } catch (e) { /* ignore */ }
                    } catch (e) {
                        // some nodes may throw (SVG etc.) - ignore
                    }
                }
                return clone;
            };

            const cloned = cloneWithInlineStyles(el);
            // Final aggressive sanitization: ensure no remaining modern color functions
            // exist in inline styles on the clone. Replace any occurrence with either
            // the computed value (if available) or a safe rgba fallback.
            try {
                const all = [cloned, ...Array.from(cloned.querySelectorAll('*'))] as HTMLElement[];
                const unsafeColorRegex = /(oklab|oklch|lab|lch|color)\([^)]*\)/gi;
                all.forEach(node => {
                    // iterate through inline style properties
                    const style = node.getAttribute('style');
                    if (!style) return;
                    if (!unsafeColorRegex.test(style)) return;
                    // try to derive safe replacements for common properties
                    const cs = window.getComputedStyle(node);
                    let newStyle = style.replace(unsafeColorRegex, (m) => {
                        // Prefer computed color values when present
                        if (cs && cs.color) return cs.color;
                        if (cs && cs.backgroundColor) return cs.backgroundColor;
                        return 'rgba(0,0,0,0)';
                    });
                    node.setAttribute('style', newStyle);
                });
            } catch (e) {
                // ignore sanitization failures
            }
            // Place clone off-screen so it renders but isn't visible
            const wrapper = document.createElement('div');
            wrapper.style.position = 'fixed';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            wrapper.style.width = el.getBoundingClientRect().width + 'px';
            wrapper.style.height = el.getBoundingClientRect().height + 'px';
            wrapper.appendChild(cloned);
            document.body.appendChild(wrapper);

            const opt = {
                margin: [10, 10, 10, 10], // mm top/right/bottom/left
                filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            try {
                await html2pdf().set(opt).from(cloned).save();
            } finally {
                // cleanup cloned node
                try { wrapper.remove(); } catch (e) { /* ignore */ }
            }
        } catch (e) {
            console.error('html2pdf export failed', e);
            alert('Failed to generate PDF.');
        }
    };

    const handleDownload = async () => {
        if (!id) { alert('Invoice ID not available'); return; }
        if (meta) { exportReturnPDF(meta); return; }
        // Server download removed — fall back to print
        console.info('Server download endpoint removed; using Print');
        try { window.print(); } catch (e) { console.error(e); alert('Unable to print'); }
    };
    

    // Prefer numeric returnInvoiceNumber (show as #N), then returnInvoiceNo, then fallback to invoiceNumber/#invoiceNo, then id
    const invoiceLabel = meta?.returnInvoiceNumber ? `#${meta.returnInvoiceNumber}` : (meta?.returnInvoiceNo || (meta?.invoiceNumber ? `#${meta.invoiceNumber}` : (meta?.invoiceNo || id || '')));

    // Derive payment status: prefer explicit paymentStatus, otherwise infer from amounts
    const deriveStatus = (m: any) => {
        if (!m) return { text: 'Unknown', color: 'bg-gray-100 text-gray-700' };
        const ps = m.paymentStatus;
        if (ps) {
            const txt = String(ps).charAt(0).toUpperCase() + String(ps).slice(1);
            return { text: txt, color: ps === 'unpaid' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' };
        }
        const balance = Number(m.balanceAmount ?? 0);
        const refunded = Number(m.amountRefunded ?? m.amountPaid ?? 0);
        if (balance === 0) return { text: 'Refunded', color: 'bg-green-100 text-green-800' };
        if (refunded && refunded > 0) return { text: 'Partially Refunded', color: 'bg-green-100 text-green-800' };
        return { text: 'Unpaid', color: 'bg-red-100 text-red-800' };
    };

    const { text: statusText, color: statusColorClass } = deriveStatus(meta);

    if (!id) return <div className="p-6">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/return/sale/sales-return-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Sales Return {' '}
                                    {isMetaLoading ? (
                                        <Skeleton className="h-6 w-40 inline-block align-middle" />
                                    ) : (
                                        invoiceLabel ? invoiceLabel : ''
                                    )}
                                </h1>
                                {isMetaLoading ? (
                                    <Skeleton className="h-6 w-24 inline-block rounded-full" />
                                ) : (
                                    meta && (
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColorClass}`}>
                                                {statusText}
                                            </span>
                                            {/* Original sale link removed per request */}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrint} className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md inline-flex items-center">
                                <Printer className="h-4 w-4 mr-2 text-gray-600" /> Print PDF
                            </button>
                            <button onClick={handleDownload} className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2 rounded-md inline-flex items-center">
                                <Download className="h-4 w-4 mr-2" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <InvoiceDownload invoiceType="sale-return" invoiceId={id} />
                </div>
            </main>
        </div>
    );
};

export default SalesReturnInvoiceViewer;
