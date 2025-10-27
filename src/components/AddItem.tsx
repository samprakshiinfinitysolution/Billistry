'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AddProduct from './AddProduct';
import { Search, X, Plus } from 'lucide-react';
import TableSkeleton from '@/components/ui/TableSkeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- START: AddItemModal Component ---

export interface ItemData {
  id: string;
  name: string;
  code: string | null;
  salesPrice: number;
  purchasePrice: number | null;
  currentStock: string | null;
  numericStock?: number | null;
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



interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ItemData, quantity: number) => void;
}

// --- START: FINAL COMPONENT with STICKY FOOTER ---

export const AddItemModal = ({ isOpen, onClose, onAddItem }: AddItemModalProps) => {
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

  // Determine if any staged quantity exceeds available numeric stock
  const hasInsufficientStock = useMemo(() => {
    return Object.entries(stagedItems).some(([itemId, qty]) => {
      const item = allItems.find(i => i.id === itemId);
      if (!item) return false;
      if (typeof item.numericStock !== 'number') return false; // unknown stock -> allow
      return qty > (item.numericStock || 0);
    });
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

  // State to control AddProduct dialog
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleProductSaved = useCallback((savedProduct: any) => {
    // Notify other components (including this modal) that products were updated
    try {
      window.dispatchEvent(new Event('productsUpdated'));
    } catch (err) {
      console.warn('Could not dispatch productsUpdated event', err);
    }
    setShowAddProduct(false);
  }, []);

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
          numericStock: (typeof p.currentStock !== 'undefined' && p.currentStock !== null) ? Number(p.currentStock) : ((typeof p.openingStock !== 'undefined' && p.openingStock !== null) ? Number(p.openingStock) : null),
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

  // Listen for other parts of the app notifying that products changed (e.g., product create/update)
  useEffect(() => {
    const handler = () => {
      // only refetch when modal is open to avoid unnecessary network calls
      if (!isOpen) return;
      (async () => {
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
              numericStock: (typeof p.currentStock !== 'undefined' && p.currentStock !== null) ? Number(p.currentStock) : ((typeof p.openingStock !== 'undefined' && p.openingStock !== null) ? Number(p.openingStock) : null),
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
    return allItems.filter(item => {
      if (showOnlyStaged) {
        // If this filter is active, only show items that are in stagedItems
        return !!stagedItems[item.id];
      }
      // Otherwise, apply the regular category and search filters
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allItems, searchTerm, selectedCategory, showOnlyStaged, stagedItems]);

  return (
    <div 
      className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col h-[85vh] transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Add Items</h2>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 flex flex-wrap gap-4 items-center border-b flex-shrink-0">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search Items" 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 h-9 flex items-center gap-2" onClick={() => setShowAddProduct(true)}>
            <Plus className="h-4 w-4" /> Create New Item
          </Button>
          {/* AddProduct dialog - opens when creating a new product from AddItem modal */}
          <AddProduct
            open={showAddProduct}
            setOpen={(v: boolean) => setShowAddProduct(v)}
            editingProduct={null}
            setEditingProduct={() => {}}
            onSave={handleProductSaved}
          />
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
                  <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 whitespace-nowrap text-gray-900 font-medium">{item.name}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">{item.code || '-'}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">₹ {formatCurrency(item.salesPrice)}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">{item.purchasePrice ? `₹ ${formatCurrency(item.purchasePrice)}` : '-'}</td>
                    <td className="py-4 whitespace-nowrap text-gray-500">
                      {typeof item.numericStock === 'number' ? (
                        <div className="flex flex-col">
                          <span className="text-sm">{Math.max(0, (item.numericStock || 0))} {item.unit || ''}</span>
                          <span className="text-xs text-gray-400">{item.currentStock ? `(${item.currentStock})` : ''}</span>
                        </div>
                      ) : (
                        item.currentStock || '-'
                      )}
                    </td>
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
                            <div className="flex flex-col items-start">
                              <span className="text-sm text-gray-600 uppercase w-16 text-left">{item.unit || 'QTY'}</span>
                              {/* Live available stock */}
                            {typeof item.numericStock === 'number' && (
                                <span className={`text-xs ${((item.numericStock || 0) - (stagedItems[item.id] || 0)) <= 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                  {(() => {
                                    const live = (item.numericStock || 0);
                                    const raw = live - (stagedItems[item.id] || 0);
                                    const unitLabel = item.unit || 'pcs';
                                    if (raw <= 0) return `Out of stock ${unitLabel}`;
                                    return `Available: ${raw} ${unitLabel}`;
                                  })()}
                                </span>
                              )}
                            </div>
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
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">No items found.</td>
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
          <div className="flex gap-3 items-center">
            <Button className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 font-semibold px-6 py-2 rounded-md" onClick={handleCloseAndReset}>
              Cancel
            </Button>
            <Button disabled={hasInsufficientStock} className={`font-semibold px-6 py-2 rounded-md ${hasInsufficientStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`} onClick={handleDoneClick}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};