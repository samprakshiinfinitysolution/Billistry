'use client';

import React, { useState } from 'react';

// Import Shadcn UI Components (make sure you've run `npx shadcn-ui@latest add ...`)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Import Lucide React Icons
import {
  ArrowUpDown,
  Box,
  ChevronDown,
  ExternalLink,
  FileBarChart,
  HelpCircle,
  Layers3,
  PackageX,
  Search,
  TrendingUp,
  Warehouse,
} from 'lucide-react';

// --- Mock Data ---
const itemsData = [
  {
    name: 'Internet 30MBPS',
    category: 'Internet charge',
    code: 'CODE322',
    stockQty: null, // No stock
    sellingPrice: 300,
    purchasePrice: null,
  },
  {
    name: 'Jeans',
    category: 'Clothing',
    code: 'CJ16',
    stockQty: '100 PCS',
    sellingPrice: 721,
    purchasePrice: 900,
  },
  {
    name: 'Milk',
    category: 'Dairy',
    code: 'MILK1',
    stockQty: '10,000 MLT',
    sellingPrice: 40,
    purchasePrice: 100,
  },
  {
    name: 'Monaco',
    category: 'Food',
    code: '3232',
    stockQty: '1,000 UNT',
    sellingPrice: 59,
    purchasePrice: 295,
  },
  {
    name: 'Samsung S24', // This item has low stock
    category: 'Mobile',
    code: null,
    stockQty: '10 UNT',
    sellingPrice: 39999,
    purchasePrice: null,
  },
  {
    name: 'Wallpaper',
    category: 'Decor',
    code: 'WP32',
    stockQty: '1,000 CCM',
    sellingPrice: 10,
    purchasePrice: 200,
  },
];

// --- Helper Functions ---
const formatCurrency = (amount) => {
  if (amount === null || typeof amount === 'undefined') return '-';
  return `₹ ${new Intl.NumberFormat('en-IN').format(amount)}`;
};

// Helper to get the numeric part of the stock quantity
const getStockNumber = (stockQty) => {
  if (!stockQty) return 0;
  const match = stockQty.match(/^[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
};

// --- Main Component ---
const ItemsPageUI = () => {
  // State for interactive filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Filtering logic
  const filteredItems = itemsData.filter((item) => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    // Low stock filter (e.g., stock is considered low if less than 20)
    const isLowStock = item.stockQty !== null && getStockNumber(item.stockQty) < 20;
    const matchesLowStock = !showLowStockOnly || isLowStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Items</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileBarChart className="h-4 w-4" />
                  Reports
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Sales Report</DropdownMenuItem>
                <DropdownMenuItem>Inventory Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Removed Settings and Keyboard buttons as requested */}
          </div>
        </header>

        {/* Stats Cards - Corrected full-width layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Stock Value
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ 15,25,361.07</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <PackageX className="h-4 w-4 text-orange-500" />
                Low Stock
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions Bar - Now Interactive */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search Item" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Decor">Decor</SelectItem>
                <SelectItem value="Internet charge">Internet charge</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showLowStockOnly ? "secondary" : "outline"} // Change variant when active
              className="w-full md:w-auto"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              Show Low Stock
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex-1">
                  <Layers3 className="mr-2 h-4 w-4" />
                  Bulk Actions
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export Selected</DropdownMenuItem>
                <DropdownMenuItem>Delete Selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="w-full md:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Item
            </Button>
          </div>
        </div>

        {/* Items Table - Maps over the `filteredItems` array */}
        <Card className="overflow-hidden border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[50px] px-4">
                    <Checkbox id="select-all" />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Item Name
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead>Item Code</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer">
                      Stock QTY
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="px-4">
                      <Checkbox id={`select-row-${index}`} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <Badge variant="secondary" className="font-normal text-xs mt-1">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{item.code || '-'}</TableCell>
                    <TableCell className="text-gray-600">{item.stockQty || '-'}</TableCell>
                    <TableCell className="font-medium text-gray-800">{formatCurrency(item.sellingPrice)}</TableCell>
                    <TableCell className="font-medium text-gray-800">{formatCurrency(item.purchasePrice)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Box className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Floating Help Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 text-white"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ItemsPageUI;