"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock API call
const fetchTransactions = async (customerId: string) => {
  return [
    {
      _id: "t1",
      date: "2025-08-10",
      description: "Invoice #1001",
      debit: 5000,
      credit: 0,
    },
    {
      _id: "t2",
      date: "2025-08-12",
      description: "Payment Received",
      debit: 0,
      credit: 2000,
    },
  ];
};

export default function CustomerLedgerPage() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (id) {
      fetchTransactions(id as string).then(setTransactions);
    }
  }, [id]);

  const filteredTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    const today = new Date();
    if (filter === "today") {
      return tDate.toDateString() === today.toDateString();
    }
    if (filter === "month") {
      return (
        tDate.getMonth() === today.getMonth() &&
        tDate.getFullYear() === today.getFullYear()
      );
    }
    if (filter === "custom" && startDate && endDate) {
      return (
        tDate >= new Date(startDate) && tDate <= new Date(endDate)
      );
    }
    return true;
  });

  const totalDebit = filteredTransactions.reduce(
    (sum, t) => sum + t.debit,
    0
  );
  const totalCredit = filteredTransactions.reduce(
    (sum, t) => sum + t.credit,
    0
  );
  const balance = totalDebit - totalCredit;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Customer Ledger</h2>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {filter === "custom" && (
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={() => alert("Open Add Transaction Modal")}
          className="ml-auto"
        >
          + Add Transaction
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((t) => (
              <TableRow key={t._id}>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className="text-right">
                  {t.debit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {t.credit.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex justify-end text-right space-x-6 text-sm font-medium">
        <div>Total Debit: {totalDebit.toFixed(2)}</div>
        <div>Total Credit: {totalCredit.toFixed(2)}</div>
        <div>Balance: {balance.toFixed(2)}</div>
      </div>
    </div>
  );
}
