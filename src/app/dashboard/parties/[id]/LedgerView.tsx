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
import { Edit, Trash2, FileText } from "lucide-react";

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
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    onTransactionDelete(txnId);
  };

  return (
    <div className="space-y-6 mt-4">
      <LedgerStats totalGave={totalGave} totalGot={totalGot} balance={balance} />
      <LedgerActions onOpenModal={handleOpenModal} />
      <LedgerTable
        transactions={transactions}
        onEdit={handleOpenModal}
        onDelete={handleDeleteTransaction}
      />
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

const LedgerStats: React.FC<{ totalGave: number; totalGot: number; balance: number }> = ({ totalGave, totalGot, balance }) => {
  const balanceType = balance >= 0 ? "To Receive" : "To Pay";
  const balanceColor = balance >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">You Gave</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold text-red-600">₹{totalGave.toFixed(2)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">You Got</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold text-green-600">₹{totalGot.toFixed(2)}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className={`text-sm font-medium ${balanceColor}`}>{balanceType}</CardTitle></CardHeader>
        <CardContent><p className={`text-2xl font-bold ${balanceColor}`}>₹{Math.abs(balance).toFixed(2)}</p></CardContent>
      </Card>
    </div>
  );
};

const LedgerActions: React.FC<{ onOpenModal: (txn: null, type: TxnType) => void }> = ({ onOpenModal }) => (
  <div className="flex gap-4">
    <Button onClick={() => onOpenModal(null, "You Gave")} variant="destructive" className="flex-1">
      Add &quot;You Gave&quot;
    </Button>
    <Button onClick={() => onOpenModal(null, "You Got")} className="flex-1 bg-green-600 text-primary-foreground hover:bg-green-600/90">
      Add &quot;You Got&quot;
    </Button>
  </div>
);

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
        <p className="mt-1 text-sm text-gray-500">Add a &quot;You Gave&quot; or &quot;You Got&quot; transaction to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((t) => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{t.description || "-"}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${t.type === "You Got" ? "text-green-600" : "text-red-600"}`}>
                  {t.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-800">₹{t.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(t._id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
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
  const [amount, setAmount] = useState(transaction?.amount.toString() || "");
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
      setAmount(transaction?.amount.toString() || "");
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
                <SelectItem value="You Gave">You Gave</SelectItem>
                <SelectItem value="You Got">You Got</SelectItem>
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