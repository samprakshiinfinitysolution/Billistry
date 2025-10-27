"use client";

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceDownload from '../../../../../../components/InvoiceDownload';

    const PurchaseReturnInvoiceViewer = ({ params }: { params: any }) => {
        const router = useRouter();
        const searchParams = useSearchParams();
        // Try to unwrap params using React.use() when available; otherwise resolve the promise in an effect
       
        const maybeParams = (React as any).use ? (React as any).use(params) : undefined;
        const initialId = maybeParams?.id ?? null;
        const [id, setId] = useState<string | null>(initialId);

    const [meta, setMeta] = useState<any>(null);
    const [isMetaLoading, setIsMetaLoading] = useState(true);
        const [returnInvoiceNo, setReturnInvoiceNo] = useState<string>('');
        const [returnInvoiceNumber, setReturnInvoiceNumber] = useState<number>(1);

        useEffect(() => {
            let mounted = true;
            const fetchMeta = async () => {
                setIsMetaLoading(true);
                try {
                    const safeId = String(id);
                    let res = await fetch(`/api/new_purchase_return/${encodeURIComponent(safeId)}`, { credentials: 'include' });
                    let body = await res.json().catch(() => null);

                    if ((!body || (body && !body._id && !(body.success && body.data))) && id) {
                        const qUrl = `/api/new_purchase_return?invoiceNo=${encodeURIComponent(id)}`;
                        res = await fetch(qUrl, { credentials: 'include' });
                        body = await res.json().catch(() => null);
                        if (Array.isArray(body) && body.length) body = body[0];
                        if (body && body.success && Array.isArray(body.data) && body.data.length) body = body.data[0];
                    }

                    if (!mounted) return;
                    if (body) {
                        const candidate = body.success && body.data ? (Array.isArray(body.data) ? (body.data[0] || null) : body.data) : (Array.isArray(body) ? body[0] : body);
                        setMeta(candidate || null);
                    } else {
                        setMeta(null);
                    }
                } catch (e) {
                    console.error('Failed to fetch purchase return meta', e);
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

        useEffect(() => {
            try {
                const editId = searchParams.get('editId');
                if (!editId) {
                    fetch('/api/new_purchase_return/preview', { credentials: 'include' })
                        .then(async (res) => res.ok ? res.json() : null)
                        .then(data => {
                            const preview = data?.data;
                            if (preview && preview.invoiceNo) {
                                setReturnInvoiceNo(preview.invoiceNo);
                                setReturnInvoiceNumber(preview.invoiceNumber || returnInvoiceNumber);
                            }
                        }).catch(() => {});
                }
            } catch (e) {}
        }, [searchParams]);

        useEffect(() => {
            try {
                const editId = searchParams.get('editId');
                if (!editId) return;
                (async () => {
                    try {
                        const res = await fetch(`/api/new_purchase_return/${editId}`, { credentials: 'include' });
                        if (!res.ok) return;
                        const body = await res.json().catch(() => ({}));
                        const d = body?.data || body;
                        if (!d) return;
                        setReturnInvoiceNo(d.invoiceNo || d.returnInvoiceNo || '');
                        setReturnInvoiceNumber(d.invoiceNumber || returnInvoiceNumber);
                        setMeta(d);
                    } catch (err) {
                        console.error('Error loading purchase return for edit', err);
                    }
                })();
            } catch (e) {}
        }, [searchParams]);

        const handlePrint = () => window.print();

        const handleDownload = async () => {
            if (!id) { alert('Invoice ID not available'); return; }
            try {
                const mod = await import('@/lib/exportPdf');
                await mod.exportElementToPdf('.invoice-print', `invoice-${id}.pdf`);
                return;
            } catch (err) {
                console.warn('DOM export failed, falling back to server download', err);
            }

            // Server download removed — fall back to print
            console.info('Server download endpoint removed; using Print');
            try { window.print(); } catch (e) { console.error(e); alert('Unable to print'); }
        };

    const invoiceLabel = meta?.returnInvoiceNumber ? `#${meta.returnInvoiceNumber}` : (meta?.returnInvoiceNo || (meta?.invoiceNumber ? `#${meta.invoiceNumber}` : (meta?.invoiceNo || id || '')));
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
                                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/return/purchase/purchase-return-data')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold text-gray-800">
                                        Purchase Return {' '}
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
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColorClass}`}>
                                                {statusText}
                                            </span>
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
                            <InvoiceDownload invoiceType="purchase-return" invoiceId={id} />
                    </div>
                </main>
            </div>
        );
    };

    export default PurchaseReturnInvoiceViewer;
