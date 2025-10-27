"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { apiService, Transaction, TransactionData } from "@/services/apiService";
import { ArrowLeft, Edit, Trash2, Phone, Mail, FileText, Banknote, Landmark, Building, Ship } from "lucide-react";
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
      <div className="mt-1 text-gray-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
};


export default function PartyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { id } = params;

  const [party, setParty] = useState<Party | null>(null);
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

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this party? This action cannot be undone.")) return;
    try {
      await apiService.deleteParty(id);
      toast.success("Party deleted successfully.");
      router.push("/dashboard/parties");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete party.");
    }
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
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <div className=" mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{party.partyName}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{party.partyType}</span>
                <span className="text-gray-300">|</span>
                <span className={`font-semibold ${party.balance > 0 ? 'text-green-600' : party.balance < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                  Balance: ₹{Math.abs(party.balance).toFixed(2)}
                  {party.balance !== 0 && <span className="text-xs ml-1 font-normal">{party.balance > 0 ? '(To Receive)' : '(To Pay)'}</span>}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

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
              partyId={id}
              transactions={transactions}
              onTransactionCreate={handleTransactionCreate}
              onTransactionUpdate={handleTransactionUpdate}
              onTransactionDelete={handleTransactionDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
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
             