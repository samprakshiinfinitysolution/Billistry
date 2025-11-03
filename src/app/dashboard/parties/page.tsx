"use client";

import toast from "react-hot-toast";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileBarChart,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  BookOpen,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuthGuard from "@/hooks/useAuthGuard";
import { apiService } from "@/services/apiService";
import TableSkeleton from '@/components/ui/TableSkeleton';

// --- Types ---
interface Party {
  _id: string;
  partyName: string;
  mobileNumber: string;
  partyType: "Customer" | "Supplier";
  balance: number;
  email?: string;
  gstin?: string;
}
type SortableColumn = keyof Omit<Party, "_id">;

interface PartiesHeaderProps {
  onAddParty: () => void;
}

// --- Party Listing Page Component ---
export default function PartiesPage() {
  const { user } = useAuthGuard();
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [partyTypeFilter, setPartyTypeFilter] = useState<"all" | "Customer" | "Supplier">("all");
  const [sortOption, setSortOption] = useState<'az' | 'za' | 'latest'>('latest');
  

  // --- Fetch Parties ---
  const fetchParties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getParties();
      setParties(Array.isArray(data.parties) ? data.parties : []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setParties([]); // Clear parties on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  // --- Add Party ---
  const handleAddParty = () => {
    router.push("/dashboard/parties/add-party");
  };

  // --- Edit Party ---
  const handleEditParty = (partyId: string) => {
    router.push(`/dashboard/parties/add-party/${partyId}`);
  };

  // --- View Party Details ---
  const handleViewParty = (partyId: string) => {
    router.push(`/dashboard/parties/${partyId}`);
  };

  // --- View Ledger ---
  const handleViewLedger = (partyId: string, partyType: "Customer" | "Supplier") => {
    router.push(`/dashboard/parties/ledger/${partyType}/${partyId}`);
  };

  // --- Delete Party ---
  const handleDeleteParty = useCallback(async (partyId: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return;
    try {
      await apiService.deleteParty(partyId);
      toast.success("Party deleted successfully");
      setParties((prev) => prev.filter((p) => p._id !== partyId));
    } catch (err: any) {
      toast.error(err.message || "Error deleting party");
    }
  }, []);

  // --- Sorting ---
  // Sorting removed for parties table per request

  // --- Filter & Sort ---
  const filteredAndSortedParties = useMemo(() => {
    let currentParties = [...parties];

    if (searchTerm) {
      currentParties = currentParties.filter(
        (party) =>
          party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          party.mobileNumber.includes(searchTerm) ||
          party.partyType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (partyTypeFilter !== "all") {
      currentParties = currentParties.filter((p) => p.partyType === partyTypeFilter);
    }

    // (balance filter removed) keep balance column visible in table

    // Sorting according to sortOption
    if (sortOption === 'az') {
      currentParties.sort((a, b) => a.partyName.localeCompare(b.partyName));
    } else if (sortOption === 'za') {
      currentParties.sort((a, b) => b.partyName.localeCompare(a.partyName));
    } else if (sortOption === 'latest') {
      // fallback: sort by _id (ObjectId-like) newest first
      currentParties.sort((a, b) => b._id.localeCompare(a._id));
    }

    return currentParties;
  }, [parties, searchTerm, partyTypeFilter, sortOption]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-3 font-inter">
      <PartiesHeader onAddParty={handleAddParty} />
      <main className="flex-1 pt-3 space-y-3 flex flex-col overflow-hidden">
        {/* page content constrained to the same max width as other dashboard pages */}
        <div className="w-full min-h-0">
          <PartiesStats parties={parties} />

          {/* Actions */}
      <div className="space-y-4 flex flex-col flex-1 min-h-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 p-0.5 w-full">
          <div className="flex items-center gap-1 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-300" />
                    <Input
                      placeholder="Search parties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search parties"
                      className="pl-10 pr-3 py-1 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                      <div className="flex items-center gap-1">
                          <Select value={partyTypeFilter} onValueChange={(v) => setPartyTypeFilter(v as any)}>
                            <SelectTrigger className="min-w-[140px] bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100 cursor-pointer">
                              <SelectValue placeholder="Party Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-gray-800 dark:text-gray-100">All</SelectItem>
                              <SelectItem value="Customer" className="text-gray-800 dark:text-gray-100">Customers</SelectItem>
                              <SelectItem value="Supplier" className="text-gray-800 dark:text-gray-100">Suppliers</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Sort filter: A-Z, Z-A, Latest (default latest) */}
                          <Select value={sortOption} onValueChange={(v) => setSortOption(v as any)}>
                            <SelectTrigger className="min-w-[140px] bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100 cursor-pointer">
                              <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="az" className="text-gray-800 dark:text-gray-100">A - Z</SelectItem>
                              <SelectItem value="za" className="text-gray-800 dark:text-gray-100">Z - A</SelectItem>
                              <SelectItem value="latest" className="text-gray-800 dark:text-gray-100">Latest</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setPartyTypeFilter('all'); setSortOption('latest'); }} className="ml-1 px-3 py-1 text-sm bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100" aria-label="Clear filters">
                            Clear
                          </Button>
                      </div>
                </div>
              </div>

            {/* Product-like container: border + rounded + white/dark bg + shadow */}
            <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm flex-1 min-h-0">
                {error ? (
                  // show error inside normal padded area (no heavy scrolling needed)
                  <div className="p-2 pb-6">
                    <p className="text-center text-red-500">{error}</p>
                  </div>
                ) : (
                  // keep outer padding but make the inner scroll container the immediate parent of the <table>
                  // so position:sticky on thead/th is calculated relative to that scroll container.
                  <div className="pt-0 pb-1 px-2">
                    <div className="max-h-[62vh] overflow-auto">
                        <PartiesTable
                        loading={loading}
                        parties={filteredAndSortedParties}
                        onEdit={handleEditParty}
                        onDelete={handleDeleteParty}
                        onViewParty={handleViewParty}
                        onViewLedger={handleViewLedger}
                        user={user}
                      />
                      </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

const PartiesHeader: React.FC<PartiesHeaderProps> = ({ onAddParty }) => (
  <header className="flex items-center justify-between px-1 py-1 border-b">
    <h1 className="text-xl font-bold text-gray-800">Parties</h1>

      <div className="flex items-center gap-2">
        <Link href="/dashboard/reports/parties-report" className="">
          <Button variant="outline" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5">
            <FileBarChart className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </Link>

        <Button onClick={onAddParty} className="ml-2">
          Create Party
        </Button>
      </div>
  </header>
);

const PartiesStats: React.FC<{ parties: Party[] }> = ({ parties }) => {
  const customers = parties.filter((p) => p.partyType === "Customer").length;
  const suppliers = parties.filter((p) => p.partyType === "Supplier").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 w-full">
      <Card>
        <CardContent className="p-0.5 flex flex-col items-start">
          <div className="flex items-center gap-1 pl-6">
            <Users className="h-5 w-5 text-blue-500 " />
            <span className="text-sm font-medium text-gray-600">All Parties</span>
          </div>
          <div className="mt-0 text-2xl font-bold text-gray-800 pl-6"><AnimatedNumber value={parties.length} duration={800} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0.5 flex flex-col items-start">
          <div className="flex items-center gap-1 pl-6">
            <FileText className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Customers</span>
          </div>
          <div className="mt-0 text-2xl font-bold text-gray-800 pl-6"><AnimatedNumber value={customers} duration={800} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0.5 flex flex-col items-start">
          <div className="flex items-center gap-1 pl-6">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Suppliers</span>
          </div>
          <div className="mt-0 text-2xl font-bold text-gray-800 pl-6"><AnimatedNumber value={suppliers} duration={800} /></div>
        </CardContent>
      </Card>
    </div>
  );
};

const TableHeader: React.FC<{
  column: SortableColumn;
  label: string;
  isSortable?: boolean;
  className?: string;
}> = ({ column, label, isSortable = false, className = "" }) => {
  const isLeftSticky = className.includes('left-0');
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
      style={isLeftSticky ? { position: 'sticky' as const, left: 0, top: 0 } : undefined}
    >
      <div className="flex items-center gap-2">
        {label}
      </div>
    </th>
  );
};

const PartiesTable: React.FC<{
  parties: Party[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewParty: (id: string) => void;
  onViewLedger: (id: string, type: "Customer" | "Supplier") => void;
  user: any;
}> = ({ parties, loading, onEdit, onDelete, onViewParty, onViewLedger, user }) => {
  const router = useRouter();
  const tableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    // runtime debug: walk up ancestors and report styles that commonly break position:sticky
    if (typeof window === 'undefined') return;
    const el = tableRef.current;
    if (!el) return;
    const problematic: Array<{el: Element, props: Record<string,string>}> = [];
    let node: Element | null = el.parentElement;
    while (node) {
      const cs = window.getComputedStyle(node as Element);
      const props: Record<string,string> = {};
      if (cs.transform && cs.transform !== 'none') props.transform = cs.transform;
      if (cs.filter && cs.filter !== 'none') props.filter = cs.filter;
      if (cs.perspective && cs.perspective !== 'none') props.perspective = cs.perspective;
      if (cs.contain && cs.contain !== 'none') props.contain = cs.contain;
      if (cs.willChange && cs.willChange !== 'auto') props.willChange = cs.willChange;
      if (cs.overflow && cs.overflow !== 'visible') props.overflow = cs.overflow;
      if (cs.overflowY && cs.overflowY !== 'visible') props.overflowY = cs.overflowY;
      if (Object.keys(props).length) problematic.push({ el: node, props });
      node = node.parentElement;
    }
    if (problematic.length) {
      console.warn('PartiesTable: found ancestor styles that can block position:sticky', problematic);
    } else {
      console.info('PartiesTable: no ancestor blocking styles detected for sticky header');
    }
  }, []);

  // show table header + skeleton when loading so widths align exactly
  if (loading) {
    return (
      <table ref={tableRef} className="min-w-full w-full">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <TableHeader column="partyName" label="Party Name" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider " />
            <TableHeader column="mobileNumber" label="Mobile Number" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <TableHeader column="gstin" label="GSTIN" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" />
            <TableHeader column="partyType" label="Party Type" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell sm:table-cell" />
            <TableHeader column="balance" label="Balance" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6} className="p-0">
              <TableSkeleton rows={6} fillHeight />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  if (parties.length === 0) {
    return (
      <table ref={tableRef} className="min-w-full w-full">
        <thead>
          <tr className="border-b dark:border-gray-700 ">
            <TableHeader column="partyName" label="Party Name" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <TableHeader column="mobileNumber" label="Mobile Number" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <TableHeader column="gstin" label="GSTIN" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" />
            <TableHeader column="partyType" label="Party Type" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell sm:table-cell" />
            <TableHeader column="balance" label="Balance" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6} className="p-0">
              <div className="p-4">
                <EmptyState onAddParty={() => onEdit('')} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table ref={tableRef} className="min-w-full w-full">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <TableHeader column="partyName" label="Party Name" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider " />
            <TableHeader column="mobileNumber" label="Mobile Number" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <TableHeader column="gstin" label="GSTIN" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell" />
            <TableHeader column="partyType" label="Party Type" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xs:table-cell sm:table-cell" />
            <TableHeader column="balance" label="Balance" isSortable={false} className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
            <th className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
      <tbody>
        {parties.map((party) => (
          <tr key={party._id} onClick={() => onViewParty(party._id)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <td className="px-2 py-2 text-sm font-medium text-gray-900 break-words max-w-[220px]">{party.partyName}</td>
            <td className="px-2 py-2 text-sm text-gray-500">{party.mobileNumber}</td>
            <td className="px-2 py-2 text-sm text-gray-500 hidden sm:table-cell">{party.gstin || '—'}</td>
            <td className="px-2 py-2 text-sm text-gray-500 hidden xs:table-cell sm:table-cell">{party.partyType}</td>
            <td className="px-2 py-2 text-sm">
              {party.balance !== 0 ? (
                <div className="flex flex-col">
                  <span className={`font-medium ${party.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹ {Math.abs(party.balance).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">{party.balance > 0 ? 'To Receive' : 'To Pay'}</span>
                </div>
              ) : (
                <span className="font-medium text-gray-800">₹ 0.00</span>
              )}
            </td>
            <td className="px-3 py-2 text-right text-sm font-medium">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 rounded hover:bg-gray-100 cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="pointer-events-auto"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(party._id);
                    }}
                    disabled={!user?.permissions?.parties?.update}
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(party._id);
                    }}
                    disabled={!user?.permissions?.parties?.delete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Using shared TableSkeleton component from `src/components/ui/TableSkeleton.tsx`

const EmptyState: React.FC<{ onAddParty: () => void }> = ({ onAddParty }) => (
  <div className="text-center p-10">
    <FileText className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No parties</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new party.</p>
    <div className="mt-6">
      <Button onClick={onAddParty}>
        <Plus className="-ml-1 mr-2 h-5 w-5" />
        Create Party
      </Button>
    </div>
  </div>
);
