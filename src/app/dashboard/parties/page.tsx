"use client";

import toast from "react-hot-toast";
import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// --- Types ---
interface Party {
  _id: string;
  partyName: string;
  mobileNumber: string;
  partyType: "Customer" | "Supplier";
  balance: number;
}

// --- Party Listing Page Component ---
export default function PartiesPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Party | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const totalParties = parties.length;

  // --- Fetch Parties ---
  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parties");
      if (!res.ok) throw new Error("Failed to fetch parties");
      const json = await res.json();
      setParties(Array.isArray(json.parties) ? json.parties : []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  // --- Add Party ---
  const handleAddParty = () => {
    router.push("/dashboard/add-party");
  };

  // --- Edit Party ---
  const handleEditParty = (partyId: string) => {
    router.push(`/dashboard/add-party/${partyId}`);
  };

  // --- Delete Party ---
  const handleDeleteParty = async (partyId: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return;

    try {
      const res = await fetch(`/api/parties/${partyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete party");
      toast.success("Party deleted successfully");
      setParties((prev) => prev.filter((p) => p._id !== partyId));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error deleting party");
    }
  };

  // --- Sorting ---
  const handleSort = (column: keyof Party) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleDropdown = (partyId: string) => {
    setActiveDropdown(activeDropdown === partyId ? null : partyId);
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
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Parties</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <FileText className="w-4 h-4" /> Reports{" "}
            <ChevronDown className="w-4 h-4" />
          </button>
          <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-l-4 border-l-blue-600">
            <p className="text-sm text-gray-500 mb-1">All Parties</p>
            <p className="text-2xl font-semibold text-gray-800">
              {totalParties}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-7xl mx-auto space-y-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading parties...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
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
                <button
                  onClick={handleAddParty}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4" /> Create Party
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm  border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("partyName")}
                      >
                        Party Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("partyType")}
                      >
                        Party Type
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("balance")}
                      >
                        Balance
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedParties.map((party) => (
                      <tr key={party._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {party.partyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {party.mobileNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {party.partyType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`font-medium ${
                              party.balance > 0
                                ? party.partyType === "Customer"
                                  ? "text-green-600"
                                  : "text-red-600"
                                : party.balance < 0
                                ? party.partyType === "Customer"
                                  ? "text-red-600"
                                  : "text-green-600"
                                : "text-gray-900"
                            }`}
                          >
                            {party.balance !== 0 && "₹ "}
                            {Math.abs(party.balance)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-gray-900"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleEditParty(party._id)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Party
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteParty(party._id)}
                                className="text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {filteredAndSortedParties.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500 text-sm"
                        >
                          No parties found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
