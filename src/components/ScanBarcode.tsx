'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Plus, Barcode } from 'lucide-react';
import TableSkeleton from '@/components/ui/TableSkeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- START: ScanBarcodeModal Component ---

export interface ItemData {
  id: string;
  name: string;
  code: string | null;
  salesPrice: number;
  purchasePrice: number | null;
  currentStock: string | null;
  category: string;
  unit?: string | null;
  taxPercent?: number | null;
  hsnCode?: string | null;
}

// Helper function from main component to format currency
const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
// Helper Button and Input from main component
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

interface ScanBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ItemData, quantity: number) => void;
}

// --- START: FINAL COMPONENT with STICKY FOOTER ---

export const ScanBarcodeModal = ({ isOpen, onClose, onAddItem }: ScanBarcodeModalProps) => {
  const [stagedItems, setStagedItems] = useState<Record<string, number>>({});

  const [allItems, setAllItems] = useState<ItemData[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const modalRef = useRef<HTMLDivElement>(null);
  const [showOnlyStaged, setShowOnlyStaged] = useState(false);

  const { selectedItemsCount, totalAmount } = useMemo(() => {
    const count = Object.keys(stagedItems).length;
    const amount = Object.entries(stagedItems).reduce((total, [itemId, quantity]) => {
        const item = allItems.find(i => i.id === itemId);
        if (item) {
            return total + (item.salesPrice * quantity);
        }
        return total;
    }, 0);
    return { selectedItemsCount: count, totalAmount: amount };
  }, [stagedItems, allItems]);

  const handleQuantityChange = useCallback((itemId: string, newQuantity: number) => {
    setStagedItems(prev => {
      const newStagedItems = { ...prev };
      if (newQuantity > 0) {
        newStagedItems[itemId] = newQuantity;
      } else {
        delete newStagedItems[itemId];
      }
      return newStagedItems;
    });
  }, []);

  const handleCloseAndReset = useCallback(() => {
    setStagedItems({});
    setShowOnlyStaged(false);
    onClose();
  }, [onClose]);

  const handleDoneClick = useCallback(() => {
    Object.entries(stagedItems).forEach(([itemId, quantity]) => {
      const itemToAdd = allItems.find(item => item.id === itemId);
      if (itemToAdd) {
        onAddItem(itemToAdd, quantity);
      }
    });
    handleCloseAndReset();
  }, [stagedItems, allItems, onAddItem, handleCloseAndReset]);

  useEffect(() => {
    const fetchItems = async () => {
        if (!isOpen) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/product');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.products)) {
        const mappedItems: ItemData[] = data.products.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    code: p.sku || null,
                    salesPrice: Number(p.sellingPrice) || 0,
                    purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : null,
          currentStock: (typeof p.currentStock !== 'undefined' && p.currentStock !== null) ? `${p.currentStock} ${p.unit || ''}`.trim() : (p.openingStock ? `${p.openingStock} ${p.unit || ''}`.trim() : null),
                    category: p.category || 'Uncategorized',
                    unit: p.unit || null,
                    taxPercent: p.taxPercent ? Number(p.taxPercent) : null,
                    hsnCode: p.hsnCode || null,
                }));
                setAllItems(mappedItems);
                setAllCategories(['All', ...Array.from(new Set(mappedItems.map(item => item.category)))]);
            } else {
                throw new Error('Invalid data format from API');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching items.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    fetchItems();
  }, [isOpen]);

  // Re-fetch when other UI updates products
  useEffect(() => {
    const handler = () => {
      if (!isOpen) return;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch('http://localhost:3000/api/product');
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            const mappedItems: ItemData[] = data.products.map((p: any) => ({
              id: p._id,
              name: p.name,
              code: p.sku || null,
              salesPrice: Number(p.sellingPrice) || 0,
              purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : null,
              currentStock: (typeof p.currentStock !== 'undefined' && p.currentStock !== null) ? `${p.currentStock} ${p.unit || ''}`.trim() : (p.openingStock ? `${p.openingStock} ${p.unit || ''}`.trim() : null),
              category: p.category || 'Uncategorized',
              unit: p.unit || null,
              taxPercent: p.taxPercent ? Number(p.taxPercent) : null,
              hsnCode: p.hsnCode || null,
            }));
            setAllItems(mappedItems);
            setAllCategories(['All', ...Array.from(new Set(mappedItems.map(item => item.category)))]);
          }
        } catch (err: any) {
          console.error('productsUpdated refetch failed', err);
        } finally {
          setLoading(false);
        }
      })();
    };
    window.addEventListener('productsUpdated', handler as EventListener);
    return () => window.removeEventListener('productsUpdated', handler as EventListener);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseAndReset();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [handleCloseAndReset]);
  
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleCloseAndReset();
    }
  };

  const filteredItems = useMemo(() => {
    if (showOnlyStaged) {
      return allItems.filter(item => !!stagedItems[item.id]);
    }

    if (!searchTerm.trim()) {
        return [];
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    return allItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        if (!matchesCategory) return false;

        const matchesSearch = item.name.toLowerCase().includes(lowercasedSearchTerm) || (item.code && item.code.toLowerCase().includes(lowercasedSearchTerm));
        return matchesSearch;
    });
  }, [allItems, searchTerm, selectedCategory, showOnlyStaged, stagedItems]);

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col h-[85vh] transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`} // Fixed height container
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Add Items by Barcode/Code</h2>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 flex flex-wrap gap-4 items-center border-b flex-shrink-0">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Scan Barcode or Search Items by Name/Code" 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus // Auto-focus for immediate scanning
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-auto min-w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>{category === 'All' ? 'Select Category' : category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 h-9 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create New Item
          </Button>
        </div>

        {/* Scrollable Table Area */}
        <div className="overflow-auto flex-1 px-6"> 
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b">
                <th className="py-3 font-medium text-gray-600 uppercase tracking-wider text-left">Item Name</th>
                <th className="py-3 font-medium text-gray-600 uppercase tracking-wider text-left">Item Code</th>
                <th className="py-3 font-medium text-gray-600 uppercase tracking-wider text-left">Sales Price</th>
                <th className="py-3 font-medium text-gray-600 uppercase tracking-wider text-left flex items-center">Purchase Price <X className="h-3 w-3 ml-1 text-gray-500" /></th>
                <th className="py-3 font-medium text-gray-600 uppercase tracking-wider text-left">Current Stock</th>
                <th className="py-3 font-medium text-gray-600 uppercase tracking-wider text-center">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={6} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-red-500">{error}</td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 whitespace-nowrap text-gray-900 font-medium">{item.name}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">{item.code || '-'}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">₹ {formatCurrency(item.salesPrice)}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">{item.purchasePrice ? `₹ ${formatCurrency(item.purchasePrice)}` : '-'}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">{item.currentStock || '-'}</td>
                    <td className="py-4 whitespace-nowrap text-center w-64">
                      {stagedItems[item.id] > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                            {/* Stepper Input */}
                            <div className="relative flex items-center w-24">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute left-0.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    onClick={() => handleQuantityChange(item.id, (stagedItems[item.id] || 0) - 1)}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    value={stagedItems[item.id]}
                                    onChange={(e) => handleQuantityChange(item.id, Math.max(0, Number(e.target.value) || 0))}
                                    className="h-8 w-full text-center px-7"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    onClick={() => handleQuantityChange(item.id, (stagedItems[item.id] || 0) + 1)}
                                >
                                    +
                                </Button>
                            </div>
                            <span className="text-sm text-gray-600 uppercase w-16 text-left">
                                {item.unit || 'QTY'}
                            </span>
                            {/* Close Button */}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleQuantityChange(item.id, 0)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                      ) : (
                        <Button className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => handleQuantityChange(item.id, 1)}>
                            + Add
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    {searchTerm.trim() ? (
                        <span>{`No items found for "${searchTerm}".`}</span>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Barcode className="w-24 h-24 text-gray-300" />
                            <p className="text-lg font-medium text-gray-600">Scan an item to begin</p>
                            <p className="text-sm">Or search by item name or code.</p>
                        </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 py-4 border-t flex justify-between items-center gap-3 bg-gray-50 flex-shrink-0">
          <div>
            {selectedItemsCount > 0 && (
                <div className="flex flex-col text-sm">
                    {!showOnlyStaged ? (
                        <span 
                            className="font-semibold text-blue-600 hover:underline cursor-pointer"
                            onClick={() => setShowOnlyStaged(true)}
                        >{selectedItemsCount} Item{selectedItemsCount > 1 ? 's' : ''} Selected</span>
                    ) : (
                        <span 
                            className="font-semibold text-blue-600 hover:underline cursor-pointer"
                            onClick={() => setShowOnlyStaged(false)}
                        >Show All Items</span>
                    )}
                    <span className="font-semibold text-gray-800">Total Amount: ₹ {formatCurrency(totalAmount)}</span>
                </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 font-semibold px-6 py-2 rounded-md" onClick={handleCloseAndReset}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-6 py-2 rounded-md" onClick={handleDoneClick}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};