"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";

interface Purchase {
  _id: string;
  invoiceNo: string;
  invoiceAmount: number;
  supplierName?: string;
  items: {
    item: { _id: string; name: string };
    quantity: number;
    rate: number;
  }[];
}

interface ReturnItem {
  item: string;
  quantity: number;
  rate: number;
  condition: "good" | "bad";
}

export default function PurchaseReturnPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [open, setOpen] = useState(false);

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get("/api/purchase", { withCredentials: true });
      setPurchases(res.data.data || []);
    } catch (err: any) {
      toast.error("Failed to fetch purchases");
    }
  };

  const handleSelectPurchase = (id: string) => {
    setSelectedPurchaseId(id);
    const purchase = purchases.find((p) => p._id === id);
    if (purchase) {
      setReturnItems(
        purchase.items.map((it) => ({
          item: it.item._id,
          quantity: 0,
          rate: it.rate,
          condition: "good",
        }))
      );
    }
  };

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...returnItems];
    const purchase = purchases.find((p) => p._id === selectedPurchaseId);
    const purchasedQty =
      purchase?.items.find((i) => i.item._id === updated[index].item)?.quantity || 0;
    updated[index].quantity = Math.min(Math.max(0, value), purchasedQty);
    setReturnItems(updated);
  };

  const handleConditionChange = (index: number, condition: "good" | "bad") => {
    const updated = [...returnItems];
    updated[index].condition = condition;
    setReturnItems(updated);
  };

  const creditTotal = useMemo(() => {
    return returnItems.reduce((sum, it) => {
      if (it.condition === "good") {
        return sum + it.rate * it.quantity;
      }
      return sum;
    }, 0);
  }, [returnItems]);

  const handleSaveReturn = async () => {
    if (!selectedPurchaseId) return toast.error("Select a purchase first");
    if (returnItems.every((i) => i.quantity === 0)) return toast.error("Select items to return");

    setLoading(true);
    try {
      await axios.post("/api/purchase-return", {
        purchaseId: selectedPurchaseId,
        items: returnItems.filter((i) => i.quantity > 0),
        creditAmount: creditTotal,
        reason,
        date: format(new Date(), "yyyy-MM-dd"),
      });
      toast.success("Purchase return saved");
      setOpen(false);
      setSelectedPurchaseId("");
      setReturnItems([]);
      setReason("");
    } catch (err: any) {
      toast.error("Failed to save purchase return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Purchase Returns</h1>
        <Button onClick={() => setOpen(true)}>+ New Purchase Return</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Return</DialogTitle>
          </DialogHeader>

          <Select value={selectedPurchaseId} onValueChange={handleSelectPurchase}>
            <SelectTrigger>
              <SelectValue placeholder="Select Purchase Invoice" />
            </SelectTrigger>
            <SelectContent>
              {purchases.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.invoiceNo} – ₹{p.invoiceAmount}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {returnItems.length > 0 && (
            <div className="mt-4 space-y-2">
              {returnItems.map((it, idx) => {
                const purchase = purchases.find((p) => p._id === selectedPurchaseId);
                const itemData = purchase?.items.find((i) => i.item._id === it.item);
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center gap-2 border p-2 rounded"
                  >
                    <span className="flex-1">{itemData?.item.name}</span>

                    <Input
                      type="number"
                      min={0}
                      max={itemData?.quantity || 0}
                      value={it.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-20"
                    />

                    <Select
                      value={it.condition}
                      onValueChange={(val) => handleConditionChange(idx, val as "good" | "bad")}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="bad">Bad</SelectItem>
                      </SelectContent>
                    </Select>

                    <span className="w-24 text-right">
                      {it.condition === "good"
                        ? `₹${(it.rate * it.quantity).toFixed(2)}`
                        : "No Credit"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {returnItems.length > 0 && (
            <div className="mt-4 space-y-3">
              <Textarea
                placeholder="Reason for return (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="text-right font-semibold">
                Credit Note Amount: ₹{creditTotal.toFixed(2)}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveReturn}
              disabled={loading || !selectedPurchaseId || returnItems.every((i) => i.quantity === 0)}
            >
              {loading ? "Saving..." : "Save Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
