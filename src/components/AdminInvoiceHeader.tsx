"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Printer } from 'lucide-react';

interface Props {
  invoiceLabel: string;
  isMetaLoading?: boolean;
  downloading?: boolean;
  onBack?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function AdminInvoiceHeader({ invoiceLabel, isMetaLoading, downloading, onBack, onPrint, onDownload }: Props) {
  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 md:left-64 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-md p-2" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-800">
                Invoice {' '}
                {isMetaLoading ? (
                  <Skeleton className="h-6 w-36 inline-block align-middle" />
                ) : (
                  invoiceLabel ? invoiceLabel : ''
                )}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onPrint} className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md inline-flex items-center" disabled={downloading}>
              <Printer className="h-4 w-4 mr-2 text-gray-600" /> Print PDF
            </button>
            <button onClick={onDownload} className="bg-indigo-600 text-white font-semibold hover:bg-indigo-700 px-4 py-2 rounded-md inline-flex items-center" disabled={downloading}>
              <Download className="h-4 w-4 mr-2" /> {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
