"use client";

import React, { useState } from 'react';
import { FileText, Truck, BarChart, HelpCircle, ChevronRight, Play, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function EInvoicingPage() {
  const [faqOpen, setFaqOpen] = useState(false);

  const faqs = [
    "What is 'e-invoicing'?...",
    'For which businesses, e-invoicing is mandatory?',
    'What are the supplies currently covered under e-invoicing?',
    'Is e-invoicing applicable to nil-rated or wholly-exempt supplies?',
    'What is the maximum number of line items supported by an e-Invoice?',
    'Will an invoice or credit/debit note be valid without an IRN, if it is required to be reported to the IRP by a notified person?',
    'Can more than one IRN be generated for the same invoice?'
  ];
  const [setupOpen, setSetupOpen] = useState(false);
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-3">
      <header className="flex items-center justify-between pb-3 border-b">
        <h1 className="text-xl font-bold text-gray-800">e-Invoicing</h1>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 text-sm rounded-md cursor-pointer">What is e-Invoicing</button>
          <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 text-sm rounded-md flex items-center gap-2 cursor-pointer"><HelpCircle className="w-4 h-4" /> Chat Support</button>
        </div>
      </header>

      <main className="flex-1 pt-3 space-y-3 flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="border rounded-md bg-white p-8 flex flex-col items-center">
              <FileText className="w-20 h-20 text-gray-500 mb-6" />
              <div className="mt-auto w-full border-t pt-6 text-center">
                <p className="text-sm font-medium text-gray-700">Automatic e-invoice generation</p>
              </div>
            </div>

            <div className="border rounded-md bg-white p-8 flex flex-col items-center">
              <Truck className="w-20 h-20 text-gray-500 mb-6" />
              <div className="mt-auto w-full border-t pt-6 text-center">
                <p className="text-sm font-medium text-gray-700">Hassle e-way bill generation using IRN</p>
              </div>
            </div>

            <div className="border rounded-md bg-white p-8 flex flex-col items-center">
              <BarChart className="w-20 h-20 text-gray-500 mb-6" />
              <div className="mt-auto w-full border-t pt-6 text-center">
                <p className="text-sm font-medium text-gray-700">Easy GSTR1 reconciliation</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 mb-6">Try India's easiest and fastest e-invoicing solution today</h2>
            <button onClick={() => setSetupOpen(true)} className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer">Start Generating e-Invoices</button>
          </div>
        </div>
      </main>

      {/* small floating help icon bottom-right (like screenshot) */}
      <div className="fixed right-6 bottom-6">
        <button onClick={() => setFaqOpen(true)} className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg cursor-pointer" aria-label="Help">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* FAQ dialog triggered from the help button */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>E-Invoicing</DialogTitle>
              <DialogClose asChild>
                <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer">
                  ✕
                </button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="mt-2">
            {(faqs).map((q, i) => (
              <button key={i} onClick={() => { /* placeholder: open detail */ }} className="flex items-center justify-between w-full text-left px-4 py-4 border-b hover:bg-gray-50 cursor-pointer">
                <span className="text-sm text-gray-800">{q}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>

          <DialogFooter>
            <div className="w-full">
              <button className="w-full bg-blue-50 text-blue-700 py-3 rounded text-center cursor-pointer">Still facing issue? Chat with us</button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add GSP Setup dialog (triggered by Start Generating e-Invoices) */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent showCloseButton={false} className="p-3 sm:max-w-4xl max-h-[78vh]">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg">Add GST Suvidha Provider</DialogTitle>
            <DialogClose asChild>
              <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer">✕</button>
            </DialogClose>
          </div>

          {/* small centered black divider directly under the title for visual emphasis */}
          <div className=" flex justify-center">
            <div className="w-full h-px bg-black rounded" />
          </div>

          <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch text-sm">
            {/* Left: large gradient card */}
            <div className="lg:col-span-2">
              <div className="rounded-md overflow-hidden h-full flex bg-gradient-to-br from-[#1e0a2b] to-[#a3308f] text-white min-h-[180px]">
                <div className="p-3 flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-semibold leading-tight">How to generate e-invoices?</h3>
                  <p className="mt-2 text-xs opacity-90">Watch video on how to add API user on IRP to generate e-invoices</p>
                  <div className="mt-3">
                    <a href="#" className="inline-flex items-center gap-2 bg-white text-red-600 px-2.5 py-1 rounded shadow cursor-pointer text-sm">
                      <Play className="w-4 h-4" />
                      <span className="font-medium">Watch Now</span>
                    </a>
                  </div>
                </div>
                <div className="w-40 hidden lg:flex items-center justify-center flex-shrink-0">
                  {/* decorative area - reserved for image; reduced width to avoid overflow */}
                </div>
              </div>
            </div>

            {/* Right: instructions + actions */}
              <div className="lg:col-span-1 flex flex-col justify-between">
                <div className="p-2 border rounded-md bg-white h-full max-h-[300px] overflow-y-auto text-xs">
                  <div className="space-y-2">
                    <p>Log in to the e-invoice portal <span className="text-blue-600">https://einvoice1.gst.gov.in/</span></p>
                    <p>From the main menu <strong>API registration</strong>.</p>
                    <p>Click on the <strong>Create API User</strong> tab under User Credentials in the API registration menu.</p>
                    <p>In the API registration form, select <strong>through GSP</strong> to integrate the APIs through GSP.</p>
                    <p>Select <strong>Masters India</strong> from the drop-down list.</p>
                    <p>Select the <strong>username and password for GSP</strong> and click submit.</p>
                  </div>
                </div>

                <a className="flex items-center gap-3 px-2 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-full text-sm">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">How to Add GSP on e-Invoice portal</span>
                </a>

                <div className="mt-2">
                  <button className="w-full bg-[#5a2fb6] text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-[#4c2492] cursor-pointer text-sm">
                    <span className="font-medium">Add GSP Username &amp; Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
          </div>

          {/* centered black divider to visually separate setup steps from contact/help */}
          <div className="mt-4 flex justify-center">
            <div className="w-full h-px bg-black rounded" />
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">Facing issue with e-Invoice? <a className="text-blue-600 underline cursor-pointer">Chat with us</a> or Call us at <a className="text-blue-600 underline" href="tel:7400417400">7400417400</a></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
