"use client";

import { useState, useMemo, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, FileText, Plus } from "lucide-react";

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

  

  const handleOpenModal = (txn: Transaction | null = null, type: TxnType = "You Gave") => {
    setModalState({ editingTxn: txn, initialType: type });
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
        handleCloseModal();
        const { transaction: newTransaction } = await apiService.createTransaction({
          ...data,
          partyId,
        });
        toast.success("Transaction created successfully");
        onTransactionCreate(newTransaction);
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

  useEffect(() => {
    // Listen for header-triggered events to open the add-transaction modal.
    const handler = () => handleOpenModal(null, 'You Got');
    window.addEventListener('open-ledger-add', handler as EventListener);
    return () => window.removeEventListener('open-ledger-add', handler as EventListener);
  }, []);

  // CTA animation state
  const [showCta, setShowCta] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowCta(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="ledger-section" className="space-y-6 mt-4 relative">
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-100 rounded-lg border">
        <div>
          {/* You can add a title here if you want, e.g., <h2 className="text-lg font-semibold">Ledger</h2> */}
        </div>
        <div className={`transition-transform duration-300 ease-out ${showCta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="hidden md:block">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleOpenModal(null, 'You Got')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenModal(null, 'You Got'); }}
              className="flex items-center gap-3 bg-white border rounded-lg px-4 py-2 shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-150"
              title="Add a payment or receipt"
            >
              <div className="bg-indigo-50 text-indigo-600 rounded-md p-2">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900">Add Transaction</div>
                <div className="text-xs text-gray-500">Record payment or receipt</div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <Button onClick={() => handleOpenModal(null, 'You Got')} className="inline-flex items-center justify-center bg-indigo-600 text-white p-3 rounded-full shadow-lg" aria-label="Add Transaction">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      <LedgerStats totalGave={totalGave} totalGot={totalGot} balance={balance} />

      <LedgerTable
        transactions={transactions}
        onEdit={handleOpenModal}
        onDelete={handleDeleteTransaction}
      />
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
          <span className="text-xs text-gray-500">Paid</span>
        </div>
      </div>
      <div className={statClass}>
        <p className="text-sm text-gray-500">Total Received</p>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalGot)}</p>
          <span className="text-xs text-gray-500">Received</span>
        </div>
      </div>
      <div className={statClass}>
        <p className="text-sm text-gray-500">Balance</p>
        <div className="mt-1 flex items-baseline justify-between">
          <p className={`text-xl font-semibold ${balancePositive ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(Math.abs(balance))}</p>
          <span className="text-xs text-gray-500">{balanceType}</span>
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
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white rounded-lg border">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions yet</h3>
        <p className="mt-1 text-sm text-gray-500">Add a transaction to see it here.</p>
        <div className="mt-4">
          <Button onClick={() => window.dispatchEvent(new CustomEvent('open-ledger-add'))} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
            Add Transaction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{t.description || "-"}</td>
                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${t.type === "You Got" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === 'You Got' ? 'Receipt' : 'Payment'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-800">{formatCurrency(t.amount)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8 text-gray-500 hover:text-blue-600" title="Edit transaction">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t._id)} className="h-8 w-8 text-gray-500 hover:text-red-600" title="Delete transaction">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
          <DialogTitle>{transaction ? "Edit" : "Add"} Transaction</DialogTitle>
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