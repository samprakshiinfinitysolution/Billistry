"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Party {
  id: string;
  name: string;
  phone: string;
  type: "Customer" | "Supplier";
}

export default function CustomerSupplierManager({
  type,
}: {
  type: "Customer" | "Supplier";
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const [open, setOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });

  const handleSave = () => {
    if (editingParty) {
      setParties((prev) =>
        prev.map((p) => (p.id === editingParty.id ? { ...p, ...form } : p))
      );
    } else {
      setParties((prev) => [
        ...prev,
        { id: Date.now().toString(), name: form.name, phone: form.phone, type },
      ]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
  };

  const resetForm = () => {
    setForm({ name: "", phone: "" });
    setEditingParty(null);
    setOpen(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{type} List</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add {type}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parties.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingParty(p);
                    setForm({ name: p.name, phone: p.phone });
                    setOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Right-side Drawer (using Dialog) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l 
          data-[state=open]:animate-in data-[state=closed]:animate-out 
          data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
        >
          <DialogHeader>
            <DialogTitle>
              {editingParty ? `Edit ${type}` : `Add ${type}`}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <Input
              placeholder={`${type} Name`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>
              {editingParty ? "Update" : "Save"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
