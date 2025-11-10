"use client";

import React, { useState } from 'react';
import { FileText, Truck, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function AutomatedBillsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-3">
      <header className="flex items-center justify-between pb-3 border-b">
        <h1 className="text-xl font-bold text-gray-800">Automated Bills</h1>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 text-sm rounded-md cursor-pointer">What is Automated Bills</button>
        </div>
      </header>

      <main className="flex-1 pt-6 overflow-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-md bg-white p-8 flex flex-col items-center h-72">
              <div className="flex-1 flex items-center justify-center w-full">
                {/* illustration image */}
                <img src="/images/automated-bills-1.svg" alt="Automated bills illustration 1" className="w-40 h-28 object-contain" />
              </div>
              <div className="mt-4 w-full border-t pt-6 text-center">
                <p className="text-base font-semibold text-gray-800">Creating repeated bills?</p>
                <p className="text-sm text-gray-500 mt-2">Automate sending of repeat bills based on a schedule of your choice</p>
              </div>
            </div>

            <div className="border rounded-md bg-white p-8 flex flex-col items-center h-72">
              <div className="flex-1 flex items-center justify-center w-full">
                <img src="/images/automated-bills-2.svg" alt="Automated bills illustration 2" className="w-40 h-28 object-contain" />
              </div>
              <div className="mt-4 w-full border-t pt-6 text-center">
                <p className="text-base font-semibold text-gray-800">Automated Billing</p>
                <p className="text-sm text-gray-500 mt-2">Send SMS reminders to customers daily/weekly/monthly</p>
              </div>
            </div>

            <div className="border rounded-md bg-white p-8 flex flex-col items-center h-72">
              <div className="flex-1 flex items-center justify-center w-full">
                <img src="/images/automated-bills-3.svg" alt="Automated bills illustration 3" className="w-40 h-28 object-contain" />
              </div>
              <div className="mt-4 w-full border-t pt-6 text-center">
                <p className="text-base font-semibold text-gray-800">Easy Reminders & Payment</p>
                <p className="text-sm text-gray-500 mt-2">Automatically receive notifications and collect payments</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-4">Schedule your repeated bills hassle-free</p>
            <button onClick={() => setOpen(true)} className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer">Create Automated Bill</button>
          </div>

          {/* Coming soon dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false} className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Coming Soon</DialogTitle>
                  <DialogClose asChild>
                    <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer">✕</button>
                  </DialogClose>
                </div>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-lg font-semibold">Automated Bills — Coming Soon</h3>
                  <p className="text-sm text-gray-600 mt-2">We're building an easy way to schedule recurring invoices and reminders. It'll save you time and keep payments on track.</p>
                </div>
              </div>

              <DialogFooter>
                <div className="w-full flex flex-col gap-2">
                  <button onClick={() => { /* placeholder: wire notify */ }} className="w-full bg-white border border-purple-600 text-purple-600 py-2 rounded-md">Notify me</button>
                  <button onClick={() => setOpen(false)} className="w-full bg-purple-600 text-white py-2 rounded-md">Close</button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
