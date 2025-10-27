"use client";

import toast from "react-hot-toast";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Settings,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  BookOpen,
  ArrowUpDown,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useAuthGuard from "@/hooks/useAuthGuard";
import { apiService } from "@/services/apiService";

// --- Types ---
interface Party {
  _id: string;
  partyName: string;
  mobileNumber: string;
  partyType: "Customer" | "Supplier";
  balance: number;
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
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>("partyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

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

    if (sortColumn) {
      currentParties.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return currentParties;
  }, [parties, searchTerm, sortColumn, sortDirection]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-inter">
      <PartiesHeader onAddParty={handleAddParty} />

      <main className="flex-1 overflow-y-auto p-6">
        <PartiesStats totalParties={parties.length} />

        {/* Actions */}
        <div className=" mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="relative flex items-center w-full sm:w-64">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search parties..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddParty}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Create Party
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <p className="text-center text-red-500 p-10">{error}</p>
            ) : parties.length === 0 ? (
              <EmptyState onAddParty={handleAddParty} />
            ) : (
              <PartiesTable
                parties={filteredAndSortedParties}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleEditParty}
                onDelete={handleDeleteParty}
                onViewParty={handleViewParty}
                onViewLedger={handleViewLedger}
                user={user}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sub-components ---

const PartiesHeader: React.FC<PartiesHeaderProps> = ({ onAddParty }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-200">
    <h1 className="text-2xl font-bold text-gray-800">Parties</h1>
    <div className="flex items-center gap-4">
      <Button variant="outline" className="hidden sm:flex">
        <FileText className="w-4 h-4 mr-2" /> Reports <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
      <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
    </div>
  </header>
);

const PartiesStats: React.FC<{ totalParties: number }> = ({ totalParties }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-white p-5 rounded-lg shadow-sm border border-l-4 border-l-blue-600">
      <p className="text-sm text-gray-500 mb-1">All Parties</p>
      <p className="text-2xl font-semibold text-gray-800">{totalParties}</p>
    </div>
  </div>
);

const TableHeader: React.FC<{
  column: SortableColumn;
  label: string;
  sortColumn: SortableColumn | null;
  sortDirection: "asc" | "desc";
  onSort: (column: SortableColumn) => void;
  isSortable?: boolean;
  className?: string;
}> = ({ column, label, sortColumn, sortDirection, onSort, isSortable = true, className = "" }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isSortable ? 'cursor-pointer' : ''} ${className}`}
    onClick={() => isSortable && onSort(column)}
  >
    <div className="flex items-center gap-2">
      {label}
      {isSortable && sortColumn === column && (
        <ArrowUpDown className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600'}`} />
      )}
    </div>
  </th>
);

const PartiesTable: React.FC<{
  parties: Party[];
  sortColumn: SortableColumn | null;
  sortDirection: "asc" | "desc";
  onSort: (column: SortableColumn) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewParty: (id: string) => void;
  onViewLedger: (id: string, type: "Customer" | "Supplier") => void;
  user: any;
}> = ({ parties, sortColumn, sortDirection, onSort, onEdit, onDelete, onViewParty, onViewLedger, user }) => {
  const router = useRouter();

  if (parties.length === 0) {
    return <p className="text-center text-gray-500 p-10">No parties found matching your criteria.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <TableHeader column="partyName" label="Party Name" {...{ sortColumn, sortDirection, onSort }} />
          <TableHeader column="mobileNumber" label="Mobile Number" {...{ sortColumn, sortDirection, onSort }} isSortable={false} />
          <TableHeader column="partyType" label="Party Type" {...{ sortColumn, sortDirection, onSort }} />
          <TableHeader column="balance" label="Balance" {...{ sortColumn, sortDirection, onSort }} />
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {parties.map((party) => (
          <tr key={party._id} onClick={() => onViewParty(party._id)} className="cursor-pointer hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{party.partyName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{party.mobileNumber}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{party.partyType}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
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
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 h-8 w-8">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                  {/* <DropdownMenuItem onSelect={() => onViewLedger(party._id, party.partyType)} className="cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" /> View Ledger
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onSelect={() => onEdit(party._id)} disabled={!user?.permissions?.parties?.update}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Party
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(party._id)} disabled={!user?.permissions?.parties?.delete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
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

const TableSkeleton = () => (
  <div className="p-4">
    <div className="space-y-3">
      <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
      ))}
    </div>
  </div>
);

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
