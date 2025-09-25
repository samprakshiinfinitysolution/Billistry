"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuthGuard from "@/hooks/useAuthGuard";

interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstnumber: string;
  accountholdername?: string;
  accountnumber?: string;
  ifsc?: string;
  branch?: string;
  upi?: string;
}

export default function SupplierPage() {
    const { user } = useAuthGuard();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstnumber: "",
    accountholdername: "",
    accountnumber: "",
    ifsc: "",
    branch: "",
    upi: "",
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  // Load suppliers
  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await fetch("/api/suppliers", { credentials: "include" });
        const data = await res.json();
        if (data.success) setSuppliers(data.suppliers);
      } catch (err) {
        console.error(err);
        alert("Failed to load suppliers");
      }
    }
    loadSuppliers();
  }, []);

  // Save or Update supplier
  const handleSaveSupplier = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and Phone are required");
      return;
    }

    setLoading(true);
    try {
      const url = editingSupplier
        ? `/api/suppliers/${editingSupplier._id}`
        : "/api/suppliers";
      const method = editingSupplier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        if (editingSupplier) {
          setSuppliers(
            suppliers.map((s) =>
              s._id === editingSupplier._id ? data.supplier : s
            )
          );
        } else {
          setSuppliers([...suppliers, data.supplier]);
        }
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          gstnumber: "",
          accountholdername: "",
          accountnumber: "",
          ifsc: "",
          branch: "",
          upi: "",
        });
        setEditingSupplier(null);
        setOpen(false);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Edit supplier
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      //id
      id: supplier._id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
      gstnumber: supplier.gstnumber || "",
      accountholdername: supplier.accountholdername || "",
      accountnumber: supplier.accountnumber || "",
      ifsc: supplier.ifsc || "",
      branch: supplier.branch || "",
      upi: supplier.upi || "",
    });
    setOpen(true);
  };

  // Delete supplier
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setSuppliers(suppliers.filter((s) => s._id !== id));
      else alert(data.error || "Failed to delete supplier");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suppliers</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  address: "",
                  gstnumber: "",
                  accountholdername: "",
                  accountnumber: "",
                  ifsc: "",
                  branch: "",
                  upi: "",
                });
                setEditingSupplier(null);
              }}
            >
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Edit Supplier" : "New Supplier"}
              </DialogTitle>
            </DialogHeader>

            {/* Basic Info */}
            <div className="grid grid-cols-1  md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
              {/* Left: Supplier Details */}
              <div className="space-y-4 p-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gstnumber">GST Number</Label>
                  <Input
                    id="gstnumber"
                    placeholder="Enter GST number"
                    value={formData.gstnumber}
                    onChange={(e) =>
                      setFormData({ ...formData, gstnumber: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Right: Bank Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="accountholdername">
                      Account Holder Name
                    </Label>
                    <Input
                      id="accountholdername"
                      placeholder="Enter account holder name"
                      value={formData.accountholdername}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountholdername: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="accountnumber">Account Number</Label>
                    <Input
                      id="accountnumber"
                      placeholder="Enter account number"
                      value={formData.accountnumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountnumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="ifsc">IFSC</Label>
                    <Input
                      id="ifsc"
                      placeholder="Enter IFSC code"
                      value={formData.ifsc}
                      onChange={(e) =>
                        setFormData({ ...formData, ifsc: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      placeholder="Enter branch name"
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="upi">UPI</Label>
                    <Input
                      id="upi"
                      placeholder="Enter UPI ID"
                      value={formData.upi}
                      onChange={(e) =>
                        setFormData({ ...formData, upi: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button full width below */}
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={handleSaveSupplier}
                disabled={loading}
              >
                {loading
                  ? editingSupplier
                    ? "Updating..."
                    : "Saving..."
                  : editingSupplier
                  ? "Update"
                  : "Save"}
              </Button>
            </div>
            {/* <div className="space-y-3">
              <Input
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                placeholder="GST Number"
                value={formData.gstnumber}
                onChange={(e) => setFormData({ ...formData, gstnumber: e.target.value })}
              />
              <Input
                placeholder="Account Holder Name"
                value={formData.accountholdername}
                onChange={(e) => setFormData({ ...formData, accountholdername: e.target.value })}
              />
              <Input
                placeholder="Account Number"
                value={formData.accountnumber}
                onChange={(e) => setFormData({ ...formData, accountnumber: e.target.value })}
              />
              <Input
                placeholder="IFSC"
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
              />
              <Input
                placeholder="Branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
              <Input
                placeholder="UPI"
                value={formData.upi}
                onChange={(e) => setFormData({ ...formData, upi: e.target.value })}
              />
              <Button onClick={handleSaveSupplier} disabled={loading}>
                {loading ? (editingSupplier ? "Updating..." : "Saving...") : editingSupplier ? "Update" : "Save"}
              </Button>
            </div> */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Supplier Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Phone
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Address
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                GST Number
              </th>


              {user?.permissions?.viewSensitiveReports && (
                <>
                
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Account Holder
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Account Number
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                IFSC
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Branch
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                UPI
              </th>
              </>

              )}
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Account Holder
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Account Number
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                IFSC
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Branch
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                UPI
              </th>
              
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.phone}</td>
                  <td className="px-4 py-2">{s.email || "-"}</td>
                  <td className="px-4 py-2">{s.address || "-"}</td>
                  <td className="px-4 py-2">{s.gstnumber || "-"}</td>
                  {/* {user?.permissions?.viewSensitiveReports && (
                    <>
                  <td className="px-4 py-2">{s.accountholdername || "-"}</td>
                  <td className="px-4 py-2">{s.accountnumber || "-"}</td>
                  <td className="px-4 py-2">{s.ifsc || "-"}</td>
                  <td className="px-4 py-2">{s.branch || "-"}</td>
                  <td className="px-4 py-2">{s.upi || "-"}</td>
                    </>  
                  )} */}
                  <td className="px-4 py-2">{s.accountholdername || "-"}</td>
                  <td className="px-4 py-2">{s.accountnumber || "-"}</td>
                  <td className="px-4 py-2">{s.ifsc || "-"}</td>
                  <td className="px-4 py-2">{s.branch || "-"}</td>
                  <td className="px-4 py-2">{s.upi || "-"}</td>
               

                  <td className="px-4 py-2 text-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
