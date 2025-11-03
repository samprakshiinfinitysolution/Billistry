"use client";

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceDownload from '../../../../../components/InvoiceDownload';

const PurchaseInvoiceViewer = ({ params }: { params: any }) => {
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
                const res = await fetch(`/api/new_purchase/${encodeURIComponent(safeId)}`, { credentials: 'include' });
                const body = await res.json().catch(() => null);
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
    // Server download endpoints removed — fall back to browser printing only.
    const handleDownload = async () => {
        console.info('Download PDF endpoint removed; using browser Print instead');
        try {
            window.print();
        } catch (e) {
            console.error('Print failed', e);
            alert('Unable to print');
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
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/purchase/purchase-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Purchase {' '}
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
                    <InvoiceDownload invoiceType="purchase" invoiceId={id} />
                </div>
            </main>
        </div>
    );
};

export default PurchaseInvoiceViewer;
