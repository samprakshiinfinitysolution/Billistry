"use client";

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
// Removed jsPDF/jsPDF-autotable in favor of server-side Playwright PDF generation
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceDownload from '../../../../../components/InvoiceDownload';



const SalesInvoiceViewer = ({ params }: { params: any }) => {
    const router = useRouter();
    // Try to unwrap params using React.use (new Next.js/React pattern). If not available,
    // fall back to awaiting the params promise inside an effect.
   
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
                const res = await fetch(`/api/new_sale/${encodeURIComponent(safeId)}`, { credentials: 'include' });
                const body = await res.json().catch(() => null);
                if (!mounted) return;
                if (body && body.success && body.data) setMeta(body.data);
                else if (body && body._id) setMeta(body);
                else setMeta(null);
            } catch (e) {
                setMeta(null);
            } finally {
                if (mounted) setIsMetaLoading(false);
            }
        };
        if (id) fetchMeta();
        return () => { mounted = false; };
    }, [id]);

    useEffect(() => {
        // If React.use wasn't available to synchronously unwrap params, resolve the promise here
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
    // Removed client-side pdf generator; server-side PDF via Playwright will be used instead

    const [downloading, setDownloading] = useState(false);
    const handleDownload = async () => {
        if (!id) return;
        setDownloading(true);

        const url = `/api/download-invoice/${encodeURIComponent(String(id))}`;

        try {
            // First attempt: fetch the PDF and download as a blob (no new tab)
            const controller = new AbortController();
            const timeoutMs = 60000; // 60s
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const res = await fetch(url, { credentials: 'include', signal: controller.signal });
                if (res.ok) {
                    const contentType = res.headers.get('content-type') || '';
                    // Prefer binary PDF
                    if (contentType.includes('application/pdf')) {
                        const arr = await res.arrayBuffer();
                        if (arr && arr.byteLength > 0) {
                            const blob = new Blob([arr], { type: 'application/pdf' });
                            const blobUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = blobUrl;
                            a.download = `invoice-${id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(blobUrl);
                            console.log('Download: fetched and downloaded blob');
                            return;
                        }
                    } else {
                        // If server returned HTML (printable page) or other content, fall through to fallback.
                        console.log('Download: server returned non-PDF content-type', contentType);
                    }
                } else {
                    console.warn('Download fetch returned not ok', res.status);
                }
            } catch (err: any) {
                if (err && err.name === 'AbortError') {
                    console.log('Download: fetch aborted (timeout)');
                } else {
                    console.error('Download: fetch failed', err);
                }
            } finally {
                clearTimeout(timeout);
            }

            // If fetch didn't return a PDF quickly, fallback to opening the URL in a new tab
            try {
                const newWin = window.open(url, '_blank', 'noopener');
                if (newWin) {
                    try { newWin.focus(); } catch (e) { /* ignore */ }
                    console.log('Download: opened new window/tab via fallback window.open');
                    return;
                }
                console.log('Download: fallback window.open returned null (possibly blocked)');
            } catch (e) {
                console.warn('Download: fallback window.open threw', e);
            }

            // Anchor fallback
            try {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.download = `invoice-${id}.pdf`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                a.remove();
                console.log('Download: triggered via anchor click fallback');
                return;
            } catch (e) {
                console.warn('Download: anchor click fallback failed', e);
            }

            // Clipboard fallback
            try {
                await navigator.clipboard.writeText(url);
                alert('Download link copied to clipboard. Please paste it into a new tab to download the PDF.');
            } catch (e) {
                // If clipboard not available, show the URL so user can copy manually
                // Use prompt to make it easy to select/copy
                // eslint-disable-next-line no-alert
                window.prompt('Download URL (copy and paste into a new tab):', url);
            }
        } catch (err) {
            console.error('Download link navigation failed', err);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    

    const invoiceLabel = meta?.invoiceNumber ? `#${meta.invoiceNumber}` : (meta?.invoiceNo || id || '');

    const paymentStatus = meta?.paymentStatus;
    const statusText = paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : 'Unknown';
    const statusColorClass = paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

    if (!id) return <div className="p-6">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/sale/sales-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Sale {' '}
                                    {isMetaLoading ? (
                                        <Skeleton className="h-6 w-40 inline-block align-middle" />
                                    ) : (
                                        invoiceLabel ? invoiceLabel : ''
                                    )}
                                </h1>
                                {isMetaLoading ? (
                                    <Skeleton className="h-6 w-24 inline-block rounded-full" />
                                ) : (
                                    paymentStatus && (
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColorClass}`}>
                                            {statusText}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrint} className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md inline-flex items-center" disabled={downloading}>
                                <Printer className="h-4 w-4 mr-2 text-gray-600" /> Print PDF
                            </button>
                            <button onClick={handleDownload} className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2 rounded-md inline-flex items-center" disabled={downloading}>
                                <Download className="h-4 w-4 mr-2" /> {downloading ? 'Downloading...' : 'Download PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <InvoiceDownload invoiceType="sale" invoiceId={id} />
                </div>
            </main>
        </div>
    );
};

export default SalesInvoiceViewer;
