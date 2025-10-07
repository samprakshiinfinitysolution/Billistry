"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceDownload from '../../../../../components/InvoiceDownload';

const PurchaseInvoiceViewer = ({ params }: any) => {
    const router = useRouter();
    const { id } = params;
    const [meta, setMeta] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        const fetchMeta = async () => {
            try {
                const res = await fetch(`/api/new_purchase/${encodeURIComponent(id)}`, { credentials: 'include' });
                const body = await res.json().catch(() => null);
                if (!mounted) return;
                if (body && body.success && body.data) setMeta(body.data);
                else if (body && body._id) setMeta(body);
                else setMeta(null);
            } catch (e) {
                setMeta(null);
            }
        };
        fetchMeta();
        return () => { mounted = false; };
    }, [id]);

    const handlePrint = () => window.print();

    const handleShare = async () => {
        const url = window.location.href;
        const title = `Purchase ${meta?.invoiceNo || meta?.invoiceNumber || id}`;
        if (navigator.share) {
            try { await navigator.share({ title, url }); }
            catch (e) { /* ignore */ }
        } else {
            try { await navigator.clipboard.writeText(url); alert('Link copied to clipboard'); } catch (e) { alert(url); }
        }
    };

    const invoiceLabel = meta?.invoiceNo || (meta?.invoiceNumber ? `#${meta.invoiceNumber}` : id);

    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={() => router.push('/dashboard/purchase/purchase-data')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-800">Purchase {invoiceLabel ? invoiceLabel : ''}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleShare} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md inline-flex items-center">
                                <Share2 className="h-4 w-4 mr-2" /> Share
                            </button>
                            <button onClick={handlePrint} className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2 rounded-md inline-flex items-center">
                                <Download className="h-4 w-4 mr-2" /> Download
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