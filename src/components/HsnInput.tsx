

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HSN {
  hsn_code: string;
  hsn_name: string;
}

interface HsnInputProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function HsnInput({ value, onChange }: HsnInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<HSN[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced API call
  useEffect(() => {
    if (!open) return; // Only run when popup open
    if (search.length < 3) {
      setData([]);
      return;
    }

    const delay = setTimeout(() => {
      setLoading(true);
      fetch(`/api/hsn?search=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((res: HSN[]) => setData(res))
        .catch((err) => console.error("Error fetching HSN:", err))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delay);
  }, [search, open]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* HSN Input */}
        <Input
          placeholder="Enter HSN code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Popup Trigger */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Find HSN</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Search HSN</DialogTitle>
            </DialogHeader>

            {/* Search Input */}
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />

            {/* Results */}
            <div className="max-h-60 overflow-y-auto border rounded">
              {loading ? (
                <div className="p-3 text-gray-500 text-sm">Loading...</div>
              ) : search.length < 3 ? (
                null
              ) : data.length > 0 ? (
                data.map((item) => (
                  <div
                    key={item.hsn_code}
                    className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
                    onClick={() => {
                      onChange(item.hsn_code);
                      setOpen(false);
                    }}
                  >
                    <div className="font-medium">{item.hsn_code}</div>
                    <div className="text-xs text-gray-600">{item.hsn_name}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-sm">No results found</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
