"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import { format } from "date-fns";
import { apiService, Transaction, TransactionData } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// removed unused icon imports (kept UI minimal)

type TxnType = "You Gave" | "You Got";

interface TransactionFormData {
  amount: number;
  description: string;
  type: TxnType;
}

interface LedgerViewProps {
  partyId: string;
  transactions: Transaction[];
  onTransactionCreate: (newTxn: Transaction) => void;
  onTransactionUpdate: (updatedTxn: Transaction) => void;
  onTransactionDelete: (txnId: string) => void;
}

// --- Main Ledger View Component ---
export default function LedgerView({ partyId, transactions, onTransactionCreate, onTransactionUpdate, onTransactionDelete }: LedgerViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<{ editingTxn: Transaction | null; initialType?: TxnType }>({ editingTxn: null, initialType: 'You Gave' });
  const [confirmDeleteTxnId, setConfirmDeleteTxnId] = useState<string | null>(null);

  const { totalGave, totalGot, balance } = useMemo(() => {
    const totals = transactions.reduce(
      (acc, t) => {
        if (t.type === "You Gave") {
          acc.totalGave += t.amount;
        } else {
          acc.totalGot += t.amount;
        }
        return acc;
      },
      { totalGave: 0, totalGot: 0 }
    );
    return { ...totals, balance: totals.totalGot - totals.totalGave };
  }, [transactions]);

  

  // Only open the modal for editing an existing transaction. Creating new transactions
  // from the Party > Transactions UI is intentionally disabled per product decision.
  const handleOpenModal = (txn: Transaction | null) => {
    if (!txn) return; // do not open modal for creating a new transaction
    setModalState({ editingTxn: txn, initialType: txn.type });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalState({ editingTxn: null, initialType: 'You Gave' });
    setIsModalOpen(false);
  };

  const handleSaveTransaction = async (data: TransactionFormData) => {
    const { editingTxn } = modalState;

    try {
      if (editingTxn) {
        handleCloseModal();
        const { transaction: updatedTransaction } = await apiService.updateTransaction(editingTxn._id, data);
        toast.success("Transaction updated successfully");
        onTransactionUpdate(updatedTransaction);
      } else {
        // Creation from this UI is disabled — inform the user and abort.
        toast.error("Creating transactions from this screen is disabled. Please create payments/receipts via invoice or payment flows.");
        return;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save transaction");
    }
  };

  const handleDeleteTransaction = async (txnId: string) => {
    // open confirmation overlay for transaction deletion
    setConfirmDeleteTxnId(txnId);
  };

  const confirmDeleteTransaction = (txnId: string | null) => {
    if (!txnId) return;
    onTransactionDelete(txnId);
    setConfirmDeleteTxnId(null);
  };

  // Note: external triggers to open an "add" modal are removed. Adding transactions
  // should be done via invoice/payment flows. This effect is intentionally empty.

  // CTA animation state
  

  return (
  // Make ledger area flexible so inner table can scroll (use min-h-0 in flex layout)
  <div id="ledger-section" className="space-y-4 mt-2 relative flex-1 min-h-0 flex flex-col">

      <LedgerStats totalGave={totalGave} totalGot={totalGot} balance={balance} />

      <div className="flex-1 flex flex-col">
        <LedgerTable
          transactions={transactions}
          onEdit={handleOpenModal}
          onDelete={handleDeleteTransaction}
        />
      </div>
      {/* Transaction delete confirmation overlay */}
      {confirmDeleteTxnId && (
        <div className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4`} onClick={() => setConfirmDeleteTxnId(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setConfirmDeleteTxnId(null)}>✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this transaction? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2" onClick={() => setConfirmDeleteTxnId(null)}>Cancel</Button>
                <Button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2" onClick={() => confirmDeleteTransaction(confirmDeleteTxnId)}>Yes, Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <TransactionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        transaction={modalState.editingTxn}
        initialType={modalState.initialType || 'You Gave'}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}

// --- Sub-components (Copied from old ledger page) ---

const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
};

const LedgerStats: React.FC<{ totalGave: number; totalGot: number; balance: number }> = ({ totalGave, totalGot, balance }) => {
  const balanceType = balance >= 0 ? "To Receive" : "To Pay";
  const balancePositive = balance >= 0;

  const statClass = "bg-white rounded-lg shadow-sm px-4 py-3 border";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={statClass}>
        <p className="text-sm text-gray-500">Total Paid</p>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalGave)}</p>
          <span className="text-xs font-medium text-red-600">Paid</span>
        </div>
      </div>
      <div className={statClass}>
        <p className="text-sm text-gray-500">Total Received</p>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalGot)}</p>
          <span className="text-xs font-medium text-green-600">Received</span>
        </div>
      </div>
      <div className={statClass}>
        <p className="text-sm text-gray-500">Balance</p>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(Math.abs(balance))}</p>
          <span className={`text-xs font-medium ${balancePositive ? 'text-green-600' : 'text-red-600'}`}>{balanceType}</span>
        </div>
      </div>
    </div>
  );
};



const LedgerTable: React.FC<{
  transactions: Transaction[];
  onEdit: (txn: Transaction) => void;
  onDelete: (id: string) => void;
}> = ({ transactions, onEdit, onDelete }) => {
  const router = useRouter();
  // Improved empty/skeleton state: render a table-shaped skeleton that mimics
  // the real ledger. This gives users context about columns and density while
  // there are no transactions or while data is loading elsewhere.
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Number</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="h-3 bg-gray-200 rounded w-36" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                    <div className="h-3 bg-gray-200 rounded w-28" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-800">
                    <div className="h-3 bg-gray-200 rounded w-20 ml-auto" />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-700">
                    <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center text-sm text-gray-500 mt-3">No transactions yet</div>
      </div>
    );
  }

  return (
    // parent must allow children to shrink — min-h-0 enables proper flex scrolling
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex-1 flex flex-col min-h-0">
      {/* Table wrapper becomes the flexible scrollable region (no fixed max-height) */}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-[63vh] bg-white pb-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 backdrop-blur-sm bg-white/60">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Number</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {transactions.map((t) => {
              // Try to infer a transaction/invoice number from description if present
              let txnNumber = "-";
              if (t.description) {
                const match = t.description.match(/#\s*([A-Za-z0-9-]+)/) || t.description.match(/Invoice\s*[:#]?\s*([A-Za-z0-9-]+)/i);
                txnNumber = match ? match[1] : t.description;
              }
              const status = (t as any).status || '-';
              // compute invoice URL (if this transaction originates from a linked invoice)
              const src = (t as any).source as string | undefined;
              const originalId = (t as any).originalId || (t as any).original_id || (t as any).invoiceId;
              let invoiceUrl: string | null = null;
              if (originalId) {
                if (src === 'sale' || src === 'newsale') invoiceUrl = `/dashboard/sale/sales-invoice/${originalId}`;
                else if (src === 'purchase' || src === 'newpurchase') invoiceUrl = `/dashboard/purchase/purchase-invoice/${originalId}`;
                else if (src === 'salesreturn') invoiceUrl = `/dashboard/return/sale/sales-return-invoice/${originalId}`;
                else if (src === 'purchasereturn') invoiceUrl = `/dashboard/return/purchase/purchase-return-invoice/${originalId}`;
              }

              return (
                <tr
                  key={t._id}
                  className={`hover:bg-gray-50 ${invoiceUrl ? 'cursor-pointer' : ''}`}
                  onClick={invoiceUrl ? () => router.push(invoiceUrl as string) : undefined}
                  onKeyDown={invoiceUrl ? (e) => { if (e.key === 'Enter' || e.key === ' ') router.push(invoiceUrl as string); } : undefined}
                  role={invoiceUrl ? 'button' : undefined}
                  tabIndex={invoiceUrl ? 0 : undefined}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                  {(() => {
                    const src = (t as any).source as string | undefined;
                    const linkedSrc = (t as any).linked?.source as string | undefined;
                    const tt = (t as any).type || (t as any).txnType || (t as any).transactionType || (t as any).type || '';
                    const isPositive = tt === 'You Got' || tt === 'YouGot' || tt === 'receipt' || tt === 'Receipt';

                    // Prefer an explicit friendly label provided in the transaction type
                    const explicitTypes = ['Sales Invoice', 'Purchase Invoice', 'Sales Return', 'Purchase Return'];
                    if (explicitTypes.includes(String(tt))) {
                      return (
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{tt}</td>
                      );
                    }

                    // Defensive fallback: if the transaction has a structured linked.source use it
                    const candidate = (linkedSrc || src || '').toString() || '';
                    const base = candidate.replace(/_payment$/i, '').toLowerCase();
                    let label = '';
                    if (base === 'newsale' || base === 'sale') label = 'Sales Invoice';
                    else if (base === 'newsalereturn' || base === 'salesreturn' || base === 'sales_return') label = 'Sales Return';
                    else if (base === 'newpurchase' || base === 'purchase') label = 'Purchase Invoice';
                    else if (base === 'newpurchasereturn' || base === 'purchasereturn' || base === 'purchase_return') label = 'Purchase Return';
                    else label = isPositive ? 'Receipt' : 'Payment';

                    return (
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{label}</td>
                    );
                  })()}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                    {txnNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-800">{formatCurrency(t.amount)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-gray-700"><StatusBadge value={status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Status badge component — renders a coloured badge for common status values
const StatusBadge: React.FC<{ value?: string | null }> = ({ value }) => {
  const raw = (value || '').toString().toLowerCase();
  let label = '-';
  let cls = 'bg-gray-100 text-gray-700';

  if (!raw || raw === '-' || raw === 'undefined') {
    label = '-';
    cls = 'bg-gray-50 text-gray-500';
  } else if (raw === 'unpaid') {
    label = 'Unpaid';
    cls = 'bg-red-100 text-red-700';
  } else if (raw === 'payment' || raw === 'refund') {
    label = raw === 'payment' ? 'Payment' : 'Refund';
    cls = 'bg-blue-100 text-blue-700';
  } else if (raw === 'cash' || raw === 'upi' || raw === 'card' || raw === 'online' || raw === 'cheque' || raw === 'bank' || raw === 'netbanking' || raw === 'bank_transfer') {
    // Paid/settled styles
    label = raw === 'upi' ? 'UPI' : raw.charAt(0).toUpperCase() + raw.slice(1).replace('_', ' ');
    cls = 'bg-green-100 text-green-700';
  } else {
    label = raw.charAt(0).toUpperCase() + raw.slice(1);
    cls = 'bg-gray-100 text-gray-700';
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>
      {label}
    </span>
  );
};

const TransactionModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  initialType: TxnType;
  onClose: () => void;
  onSave: (data: TransactionFormData) => void;
}> = ({ isOpen, onOpenChange, transaction, initialType, onClose, onSave }) => {
  const [type, setType] = useState<TxnType>(transaction?.type || initialType);
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [description, setDescription] = useState(transaction?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("Please enter a valid amount.");
      return;
    }
    onSave({
      type,
      amount: parseFloat(amount),
      description,
    });
  };

  useEffect(() => {
    if (isOpen) {
      setType(transaction?.type || initialType);
      setAmount(transaction?.amount?.toString() || "");
      setDescription(transaction?.description || "");
    }
  }, [isOpen, transaction, initialType]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value: TxnType) => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="You Gave">Payment</SelectItem>
                <SelectItem value="You Got">Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Invoice #123"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};