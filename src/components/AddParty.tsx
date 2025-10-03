'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { CreateParty } from './CreateParty';

// Interfaces and Types
export interface Party {
    id: string;
    name: string;
    balance: number;
    phone: string;
    address?: string;
}

// Helper Components (copied from invoice pages for encapsulation)
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) => (
    <button
        {...props}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${props.className}`}
    >
        {children}
    </button>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
    />
));
Input.displayName = "Input";

// Helper Function
const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Component Props
interface AddPartyProps {
    selectedParty: Party | null;
    onSelectParty: (party: Party) => void;
    onClearParty: () => void;
    partyType: 'Customer' | 'Supplier'; 
}

export const AddParty = ({ selectedParty, onSelectParty, onClearParty, partyType }: AddPartyProps) => {
    const [isAddingParty, setIsAddingParty] = useState(false);
    const [partySearchTerm, setPartySearchTerm] = useState('');
    const [partyList, setPartyList] = useState<Party[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreatePartyModalOpen, setCreatePartyModalOpen] = useState(false);
    const partySelectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (partySelectionRef.current && !partySelectionRef.current.contains(event.target as Node)) {
                setIsAddingParty(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchParties = async () => {
            if (isAddingParty) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/parties?type=${partyType}`);
                    const data = await res.json();
                    if (data.success) {
                        const mappedParties: Party[] = data.parties.map((p: any) => ({
                            id: p._id,
                            name: p.partyName,
                            balance: p.balance || 0,
                            phone: p.mobileNumber,
                            address: p.billingAddress,
                        }));
                        setPartyList(mappedParties);
                    } else {
                        toast.error(data.error || `Failed to fetch ${partyType}s.`);
                    }
                } catch (error) {
                    toast.error(`An error occurred while fetching ${partyType}s.`);
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchParties();
    }, [isAddingParty, partyType]);

    const handleInternalSelect = (party: Party) => {
        onSelectParty(party);
        setIsAddingParty(false);
        setPartySearchTerm('');
    };

    const handleChangeClick = () => {
        onClearParty();
        setIsAddingParty(true);
    };

    const filteredParties = partyList.filter(party =>
        party.name.toLowerCase().includes(partySearchTerm.toLowerCase()) ||
        (party.phone && party.phone.includes(partySearchTerm)) ||
        (party.address && party.address.toLowerCase().includes(partySearchTerm.toLowerCase()))
    );

    const label = partyType === 'Customer' ? 'Bill To' : 'Bill From';

    return (
        <>
            <CreateParty
                isOpen={isCreatePartyModalOpen}
                onClose={() => setCreatePartyModalOpen(false)} 
                partyType={partyType}
                onSaveSuccess={(newPartyData) => {
                    // This function is called from CreateParty after a successful save
                    const newParty: Party = {
                        id: newPartyData._id,
                        name: newPartyData.partyName,
                        balance: newPartyData.balance || 0,
                        phone: newPartyData.mobileNumber,
                        address: newPartyData.billingAddress,
                    };

                    // Add to local list to make it searchable immediately
                    setPartyList(prev => [newParty, ...prev]);

                    // Automatically select the new party
                    handleInternalSelect(newParty);

                    // Close the modal
                    setCreatePartyModalOpen(false);
                }}
            />
            <div className="relative" ref={partySelectionRef}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                {selectedParty ? (
                    <div className="border rounded-lg p-4 min-h-[150px] flex flex-col justify-between bg-gray-50">
                        <div>
                            <p className="font-semibold text-gray-800">{selectedParty.name}</p>
                            {selectedParty.address && <p className="text-sm text-gray-500 mt-1">{selectedParty.address}</p>}
                            {selectedParty.phone && <p className="text-sm text-gray-500">{selectedParty.phone}</p>}
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-sm text-gray-600">
                                Balance: <span className={selectedParty.balance < 0 ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>₹{formatCurrency(Math.abs(selectedParty.balance))}</span>
                            </p>
                            <Button variant="link" className="text-blue-600 p-0 text-sm h-auto" onClick={handleChangeClick}>
                                Change
                            </Button>
                        </div>
                    </div>
                ) : isAddingParty ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[150px] flex flex-col">
                        <Input
                            placeholder={`Search Party by name or number`}
                            value={partySearchTerm}
                            onChange={(e) => setPartySearchTerm(e.target.value)}
                            autoFocus
                            className="mb-2"
                        />
                        <ul className="flex-1 max-h-32 overflow-y-auto divide-y">
                            {loading ? (
                                <li className="p-2 text-center text-gray-500">Loading...</li>
                            ) : filteredParties.length > 0 ? filteredParties.map(party => (
                                <li key={party.id} onClick={() => handleInternalSelect(party)} className="p-2 hover:bg-gray-100 rounded cursor-pointer flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-sm">{party.name}</div>
                                            {party.address && <div className="text-xs text-gray-500">{party.address}</div>}
                                            {party.phone && <div className="text-xs text-gray-500">{party.phone}</div>}
                                        </div>
                                        <div className={`text-xs flex items-center ${party.balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {party.balance !== 0 ? `₹${formatCurrency(Math.abs(party.balance))}` : '₹0.00'}
                                            {party.balance < 0 && <ArrowUp className="h-3 w-3 ml-1" />}
                                        </div>
                                    </div>
                                </li>
                            )) : <li className="p-2 text-center text-gray-500">No {partyType.toLowerCase()}s found.</li>}
                        </ul>
                        <Button variant="link" className="w-full text-blue-600 mt-2" onClick={() => setCreatePartyModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Party
                        </Button>
                    </div>
                ) : (
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center w-full max-w-xs h-[150px] cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setIsAddingParty(true)}
                    >
                        <Button variant="outline" className="text-blue-600 border-none pointer-events-none">
                            <Plus className="mr-2 h-4 w-4" /> Add Party
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};