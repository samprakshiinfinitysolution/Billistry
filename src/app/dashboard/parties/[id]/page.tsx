"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { apiService, Transaction, TransactionData } from "@/services/apiService";
import { ArrowLeft, Edit, Trash2, Phone, Mail, FileText, Banknote, Landmark, Building, Ship, Plus, List } from "lucide-react";
import HeaderTabs from "@/components/HeaderTabs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LedgerView from "./LedgerView";
import { Party } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DetailItem = ({ label, value }: { label: string; value?: string | number }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
  );
};

const DetailItemWithIcon = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 text-indigo-600 bg-indigo-50 rounded-full p-2">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
};


export default function PartyDetailPage() {
  const params = useParams() as { id?: string } | null;
  const router = useRouter();
  const id = params?.id;

  const [party, setParty] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tabValue, setTabValue] = useState<'details' | 'transactions'>('details');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // The API now returns both party and transactions
      const { party, transactions } = await apiService.getPartyById(id);
      setParty(party);
      setTransactions(transactions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load party data.");
      toast.error(err.message || "Failed to load party data.");
      setParty(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  const handleTransactionUpdate = (updatedTxn: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t._id === updatedTxn._id ? updatedTxn : t))
    );
    // Re-fetch party to update balance
    fetchParty();
  };

  const handleTransactionCreate = (newTxn: Transaction) => {
    setTransactions(prev => [...prev, newTxn]);
    // Re-fetch party to update balance
    fetchParty();
  };

  const handleTransactionDelete = (txnId: string) => {
    const originalTransactions = [...transactions];
    setTransactions(prev => prev.filter(t => t._id !== txnId));

    apiService.deleteTransaction(txnId)
      .then(() => {
        toast.success("Transaction deleted successfully");
        // Re-fetch party to update balance
        fetchParty();
      })
      .catch((err: any) => {
        toast.error(err.message || "Failed to delete transaction");
        // Revert to original state on error
        setTransactions(originalTransactions);
      });
  };


  const handleEdit = () => {
    router.push(`/dashboard/parties/add-party/${id}`);
  };

  const handleDelete = () => {
    // open confirmation overlay
    setShowDeleteConfirm(true);
  };

  const confirmDeleteParty = async () => {
    if (!id) return;
    try {
      await apiService.deleteParty(id);
      toast.success("Party deleted successfully.");
      router.push("/dashboard/parties");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete party.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleOpenNewTransaction = () => {
    try {
      setTabValue('transactions');
      // scroll to ledger area then dispatch an event so LedgerView opens its modal
      setTimeout(() => {
        const section = document.getElementById('ledger-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.dispatchEvent(new CustomEvent('open-ledger-add'));
      }, 120);
    } catch (e) { console.debug('Open new txn failed', e); }
  };

  if (loading) {
    return <PartyDetailSkeleton />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!party) {
    return <div className="p-6 text-center">Sorry, the requested party could not be found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      {/* Top header: match other pages (sticky white header with shadow) */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{party.partyName}</h1>
                <div className="flex items-center gap-2 text-sm mt-1 text-gray-500">
                  <span>{party.partyType}</span>
                  <span className="text-gray-300">|</span>
                  <span className={`font-semibold ${party.balance > 0 ? 'text-green-600' : party.balance < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                    ₹{Math.abs(party.balance).toFixed(2)}{party.balance !== 0 && <span className="text-xs ml-1 font-normal">{party.balance > 0 ? '(To Receive)' : '(To Pay)'}</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button className="px-3 py-2 hidden sm:inline-flex" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit Party
              </Button>
              <Button variant="outline" size="icon" className="sm:hidden" onClick={handleEdit}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="destructive" className="px-3 py-2" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="p-6 max-w-7xl mx-auto">

  {/* Tabs */}
  <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as 'details' | 'transactions')} className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <HeaderTabs 
                items={[
                  { value: 'details', label: 'Details', icon: <FileText className="w-4 h-4" /> },
                  { value: 'transactions', label: 'Transactions', icon: <List className="w-4 h-4" /> },
                ]}
                value={tabValue}
                onChange={(v) => setTabValue(v as 'details' | 'transactions')} className="cursor-pointer"
              />
            </div>
            <div className="ml-4">
              {/* Add button moved into LedgerView for a cleaner Transactions layout */}
            </div>
          </div>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Contact & Tax</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <DetailItemWithIcon icon={<Phone size={20} />} label="Mobile Number" value={party.mobileNumber} />
                    <DetailItemWithIcon icon={<Mail size={20} />} label="Email" value={party.email} />
                    <DetailItemWithIcon icon={<FileText size={20} />} label="GSTIN" value={party.gstin} />
                    <DetailItemWithIcon icon={<FileText size={20} />} label="PAN Number" value={party.panNumber} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItemWithIcon icon={<Building size={20} />} label="Billing Address" value={party.billingAddress || "Not provided"} />
                    <DetailItemWithIcon icon={<Ship size={20} />} label="Shipping Address" value={party.shippingAddress || "Not provided"} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
                  <CardContent>
                    <DetailItemWithIcon icon={<Banknote size={20} />} label="Opening Balance" value={`₹ ${party.openingBalance?.toFixed(2)}`} />
                  </CardContent>
                </Card>

                {party.bankDetails && (party.bankDetails.accountNumber || party.bankDetails.upiId) && (
                  <Card>
                    <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <DetailItemWithIcon icon={<Landmark size={20} />} label="Account Holder" value={party.bankDetails.accountHolderName} />
                      <DetailItemWithIcon icon={<Landmark size={20} />} label="Account Number" value={party.bankDetails.accountNumber} />
                      <DetailItemWithIcon icon={<Landmark size={20} />} label="IFSC Code" value={party.bankDetails.ifsc} />
                      <DetailItemWithIcon icon={<Landmark size={20} />} label="Bank Name" value={party.bankDetails.bankName} />
                      <DetailItemWithIcon icon={<Landmark size={20} />} label="UPI ID" value={party.bankDetails.upiId} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <LedgerView
              partyId={id!}
              transactions={transactions}
              onTransactionCreate={handleTransactionCreate}
              onTransactionUpdate={handleTransactionUpdate}
              onTransactionDelete={handleTransactionDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
        {/* Party delete confirmation overlay */}
        {showDeleteConfirm && (
          <div className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4`} onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowDeleteConfirm(false)}>✕</button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete <strong>{party?.partyName}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button className="bg-red-600 text-white hover:bg-red-700 px-4 py-2" onClick={confirmDeleteParty}>Yes, Delete</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

const PartyDetailSkeleton = () => (
  <div className="p-6 bg-gray-50 min-h-screen font-inter animate-pulse">
    <div className=" mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
        </div>
      </header>
      <div className="h-10 w-full bg-gray-200 rounded-md mb-4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-6">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);
             