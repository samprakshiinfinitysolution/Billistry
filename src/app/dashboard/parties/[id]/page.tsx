"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiService, Transaction } from "@/services/apiService";
import { ArrowLeft, ArrowUp, ArrowDown, Edit, Trash2, Phone, Mail, FileText, Landmark, Building, Ship, List, ChevronDown, FilePlus, CornerUpLeft, CornerDownRight } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import HeaderTabs from "@/components/HeaderTabs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import LedgerView from "./LedgerView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const SmallSkeleton = ({ className = "h-4 w-full bg-gray-100 rounded animate-pulse" }: { className?: string }) => (
  <div className={className} />
);

export default function PartyDetailPage() {
  const params = useParams() as { id?: string } | null;
  const router = useRouter();
  const id = params?.id;

  const [party, setParty] = useState<any>(null);
  const [partiesList, setPartiesList] = useState<any[]>([]);
  const [partiesLoading, setPartiesLoading] = useState<boolean>(true);
  const [partiesFetched, setPartiesFetched] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tabValue, setTabValue] = useState<'details' | 'transactions'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParty = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getPartyById(id);
      setParty(res.party);
      setTransactions(res.transactions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load party');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch the current party whenever the id changes
  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  // Fetch the parties list only once on mount. Try to hydrate from sessionStorage
  // so the left pane renders immediately without any loading text. Perform a
  // background fetch to refresh cache; only show "No parties" after the
  // background fetch finishes.
  useEffect(() => {
    let mounted = true;

    // Try to hydrate from sessionStorage first
    try {
      const raw = sessionStorage.getItem('partiesListCache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPartiesList(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
    } finally {
      // do not flip partiesFetched here — background fetch decides that
      setPartiesLoading(false);
    }

    (async () => {
      try {
        const res = await apiService.getParties();
        if (!mounted) return;
        const list = Array.isArray(res.parties) ? res.parties : [];
        setPartiesList(list);
        try {
          sessionStorage.setItem('partiesListCache', JSON.stringify(list));
        } catch (e) {
          // ignore storage errors
        }
      } catch (e) {
        if (!mounted) return;
        // keep existing list (possibly hydrated) and mark fetched
      } finally {
        if (!mounted) return;
        setPartiesLoading(false);
        setPartiesFetched(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleTransactionUpdate = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t._id === updated._id ? updated : t));
    fetchParty();
  };

  const handleTransactionCreate = (created: Transaction) => {
    setTransactions(prev => [...prev, created]);
    fetchParty();
  };

  const handleTransactionDelete = async (txnId: string) => {
    const backup = [...transactions];
    setTransactions(prev => prev.filter(t => t._id !== txnId));
    try {
      await apiService.deleteTransaction(txnId);
      toast.success('Transaction deleted');
      fetchParty();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
      setTransactions(backup);
    }
  };

  const handleEdit = () => router.push(`/dashboard/parties/add-party/${id}`);
  const handleDelete = () => {
    // Prevent deleting a party that already has transactions. User must
    // delete all transactions (invoices/returns/payments) before deleting
    // the party record.
    if (transactions && transactions.length > 0) {
      toast.error(
        "You cannot delete this party because you have made entries for this party. Please delete all the entries to delete the party"
      );
      return;
    }
    setShowDeleteConfirm(true);
  };
  const confirmDeleteParty = async () => {
    if (!id) return;
    try {
      await apiService.deleteParty(id);
      toast.success('Party deleted');
      router.push('/dashboard/parties');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete party');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      <div className="w-full h-screen flex">
        <aside className="w-72 hidden md:block h-screen">
          <div className="bg-white border rounded-none shadow-sm p-3 h-full flex flex-col">
            <div className="mb-3 sticky top-0 z-20 bg-white pt-2">
              <input placeholder="Search Party" value={""} readOnly className="w-full text-sm bg-white border rounded px-3 py-2" />
            </div>
            <ul className="space-y-3 overflow-auto flex-1 pr-2 py-2">
              {partiesList.length === 0 ? (
                <li className="text-center text-sm text-gray-500 py-6">No parties</li>
              ) : (
                partiesList.map(p => (
                  <li key={p._id}>
                    <button onClick={() => router.push(`/dashboard/parties/${p._id}`)} className={`w-full text-left px-4 py-3 rounded-md flex items-center justify-between hover:bg-gray-50 cursor-pointer ${p._id === id ? 'bg-violet-50 border border-violet-200' : ''}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{p.partyName}</div>
                        <div className="text-xs text-gray-500">{p.mobileNumber || ''}</div>
                      </div>
                      <div className="text-sm font-semibold flex flex-col items-end">
                        <span className="text-gray-800">₹{Math.abs(p.balance).toFixed(2)}</span>
                        <span className={`text-xs ${Number(p.balance) > 0 ? 'text-green-600' : Number(p.balance) < 0 ? 'text-red-600' : 'text-gray-500'}`}>{Number(p.balance) > 0 ? 'To Collect' : Number(p.balance) < 0 ? 'To Pay' : 'Settled'}</span>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/parties')}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    {loading ? (
                      <div className="space-y-2">
                        <SmallSkeleton className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                        <SmallSkeleton className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-lg font-semibold text-gray-800">{party?.partyName}</h1>
                        <div className="flex items-center gap-2 text-sm mt-1 text-gray-500">
                          <span>{party?.partyType}</span>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-2">
                            {party?.balance > 0 ? <ArrowDown className="w-4 h-4 text-green-600" /> : party?.balance < 0 ? <ArrowUp className="w-4 h-4 text-red-600" /> : null}
                            <span className="font-semibold text-gray-800">₹{Math.abs(party?.balance || 0).toFixed(2)}</span>
                            <span className={`text-xs font-medium ${party?.balance > 0 ? 'text-green-600' : party?.balance < 0 ? 'text-red-600' : 'text-gray-500'}`}>{party?.balance > 0 ? 'To Collect' : party?.balance < 0 ? 'To Pay' : 'Settled'}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!loading && (
                    <>
                      {/* Dropdown similar to provided design */}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button className="hidden sm:inline-flex items-center rounded-lg border border-violet-200 bg-white text-gray-700 px-4 py-1 hover:bg-violet-50 transition-colors cursor-pointer min-w-[200px] justify-between">
                            <div className="flex items-center gap-2">
                              <FilePlus className="w-4 h-4 text-violet-600" />
                              <span className="text-sm font-medium">Create Invoice</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400 ml-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="mt-2 w-[200px]">
                          <DropdownMenuItem onSelect={() => router.push(`/dashboard/sale/sales-invoice?partyId=${id}`) }>
                            <FileText className="w-4 h-4 mr-2" />
                            <span>Sales Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push(`/dashboard/purchase/purchase-invoice?partyId=${id}`) }>
                            <FileText className="w-4 h-4 mr-2" />
                            <span>Purchase Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push(`/dashboard/return/sale/sales-return-invoice?partyId=${id}`) }>
                            <CornerUpLeft className="w-4 h-4 mr-2" />
                            <span>Sales Return Invoice</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push(`/dashboard/return/purchase/purchase-return-invoice?partyId=${id}`) }>
                            <CornerDownRight className="w-4 h-4 mr-2" />
                            <span>Purchase Return Invoice</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button className="px-3 py-1 hidden sm:inline-flex" onClick={handleEdit}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                      <Button variant="destructive" className="px-3 py-1" onClick={handleDelete}><Trash2 className="w-4 h-4" /></Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as any)} className="w-full h-full">
              <div className="px-3 pt-4 pb-0 mt-2">
                <HeaderTabs items={[{ value: 'transactions', label: 'Transactions', icon: <List className="w-4 h-4" /> }, { value: 'details', label: 'Details', icon: <FileText className="w-4 h-4" /> }]} value={tabValue} onChange={(v) => setTabValue(v as any)} className="cursor-pointer" />
              </div>

              <TabsContent value="transactions">
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-3">
                  {loading ? (
                    <div className="space-y-3 py-4">
                      <SmallSkeleton className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-10 bg-white rounded shadow-sm p-4">
                        <SmallSkeleton />
                        <div className="mt-4 space-y-2">
                          <SmallSkeleton className="h-3 w-full" />
                          <SmallSkeleton className="h-3 w-full" />
                          <SmallSkeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <LedgerView partyId={id!} transactions={transactions} onTransactionCreate={handleTransactionCreate} onTransactionUpdate={handleTransactionUpdate} onTransactionDelete={handleTransactionDelete} />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="flex-1 min-h-0 overflow-auto px-3">
                  {loading ? (
                    <div className="mt-4 space-y-4">
                      <div className="h-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader><CardTitle>Contact & Tax</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <DetailItemWithIcon icon={<Phone size={20} />} label="Mobile Number" value={party?.mobileNumber} />
                            <DetailItemWithIcon icon={<Mail size={20} />} label="Email" value={party?.email} />
                            <DetailItemWithIcon icon={<FileText size={20} />} label="GSTIN" value={party?.gstin} />
                            <DetailItemWithIcon icon={<FileText size={20} />} label="PAN Number" value={party?.panNumber} />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItemWithIcon icon={<Building size={20} />} label="Billing Address" value={party?.billingAddress || "Not provided"} />
                            <DetailItemWithIcon icon={<Ship size={20} />} label="Shipping Address" value={party?.shippingAddress || "Not provided"} />
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-3">
                              {party?.openingBalance > 0 ? <ArrowDown className="w-4 h-4 text-green-600" /> : party?.openingBalance < 0 ? <ArrowUp className="w-4 h-4 text-red-600" /> : null}
                              <div className="font-semibold text-lg text-gray-800">
                                ₹{Math.abs(party?.openingBalance || 0).toFixed(2)}
                              </div>
                              {party?.openingBalance !== 0 && (<div className={`text-xs ${party?.openingBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>{party?.openingBalance > 0 ? 'To Collect' : 'To Pay'}</div>)}
                            </div>
                          </CardContent>
                        </Card>

                        {party?.bankDetails && (party.bankDetails.accountNumber || party.bankDetails.upiId) && (
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
                  )}
                </div>
              </TabsContent>
            </Tabs>

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
        </div>
      </div>
    </div>
  );
}
