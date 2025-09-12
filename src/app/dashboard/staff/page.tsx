// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Select, SelectItem } from "@/components/ui/select";
// import { Trash2, Edit } from "lucide-react";

// export default function StaffPage() {
//   const [staff, setStaff] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(false);
//   const [editStaff, setEditStaff] = useState<any>(null);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     role: "staff",
//     permissions: {} as Record<string, boolean>,
//   });

//   // Load staff
//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   const fetchStaff = async () => {
//     try {
//       const { data } = await axios.get("/api/staff");
//       setStaff(data || []);
//     } catch (err) {
//       console.error("Failed to load staff:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Save (Add or Update)
//   const handleSave = async () => {
//     try {
//       if (editStaff) {
//         await axios.put(`/api/staff/${editStaff._id}`, form);
//       } else {
//         await axios.post("/api/staff", form);
//       }
//       setForm({ name: "", email: "", phone: "", role: "staff", permissions: {} });
//       setEditStaff(null);
//       setOpen(false);
//       fetchStaff();
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   // Delete staff
//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this staff?")) return;
//     try {
//       await axios.delete(`/api/staff/${id}`);
//       setStaff((prev) => prev.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const permissionList = [
//     "manageBusiness",
//     "manageStaff",
//     "manageSubscription",
//     "manageProducts",
//     "manageSales",
//     "managePurchases",
//     "manageExpenses",
//     "viewReports",
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold">Staff Management</h1>
//         <Button
//           onClick={() => {
//             setForm({ name: "", email: "", phone: "", role: "staff", permissions: {} });
//             setEditStaff(null);
//             setOpen(true);
//           }}
//         >
//           + Add Staff
//         </Button>
//       </div>

//       {/* Staff List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Staff Members</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p>Loading...</p>
//           ) : staff.length === 0 ? (
//             <p className="text-gray-500">No staff added yet.</p>
//           ) : (
//             <ul className="divide-y">
//               {staff.map((member) => (
//                 <li
//                   key={member._id}
//                   className="py-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <p className="font-medium">{member.name}</p>
//                     <p className="text-sm text-gray-500">
//                       {member.email || member.phone}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span className="capitalize text-sm text-gray-600">
//                       {member.role}
//                     </span>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setForm({
//                           name: member.name,
//                           email: member.email,
//                           phone: member.phone,
//                           role: member.role,
//                           permissions: member.permissions || {},
//                         });
//                         setEditStaff(member);
//                         setOpen(true);
//                       }}
//                     >
//                       <Edit size={16} />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDelete(member._id)}
//                     >
//                       <Trash2 size={16} />
//                     </Button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>

//       {/* Add/Edit Staff Modal */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               {editStaff ? "Edit Staff" : "Add New Staff"}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <Input
//               placeholder="Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//             />
//             <Input
//               placeholder="Email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//             />
//             <Input
//               placeholder="Phone"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//             />

//             {/* Role */}
//             <Select
//               value={form.role}
//               onValueChange={(role) => setForm({ ...form, role })}
//             >
//               <SelectItem value="staff">Staff</SelectItem>
//               <SelectItem value="manager">Manager</SelectItem>
//             </Select>

//             {/* Permissions */}
//             <div className="grid grid-cols-2 gap-2">
//               {permissionList.map((perm) => (
//                 <label key={perm} className="flex items-center space-x-2 text-sm">
//                   <input
//                     type="checkbox"
//                     checked={form.permissions?.[perm] || false}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         permissions: {
//                           ...form.permissions,
//                           [perm]: e.target.checked,
//                         },
//                       })
//                     }
//                   />
//                   <span className="capitalize">
//                     {perm.replace(/([A-Z])/g, " $1")}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave}>
//               {editStaff ? "Update" : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Trash2, Edit } from "lucide-react";
// import { toast } from "react-hot-toast";

// export default function StaffPage() {
//   const [staff, setStaff] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(false);
//   const [editStaff, setEditStaff] = useState<any>(null);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     role: "staff",
//     permissions: {} as Record<string, boolean>,
//   });

//   const permissionList = [
//     "manageBusiness",
//     "manageStaff",
//     "manageSubscription",
//     "manageProducts",
//     "manageSales",
//     "managePurchases",
//     "manageExpenses",
//     "viewReports",
//   ];

//   // Load all staff
//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   const fetchStaff = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get("/api/staff");
//       setStaff(data || []);
//     } catch (err) {
//       console.error("Failed to load staff:", err);
//       toast.error("Failed to load staff");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open edit modal and fetch latest staff data
//   const handleEdit = async (id: string) => {
//     try {
//       const { data } = await axios.get(`/api/staff/${id}`);
//       setForm({
//         name: data.name,
//         email: data.email,
//         phone: data.phone,
//         role: data.role,
//         permissions: data.permissions || {},
//       });
//       setEditStaff(data);
//       setOpen(true);
//     } catch (err) {
//       console.error("Failed to load staff:", err);
//       toast.error("Failed to load staff details");
//     }
//   };

//   // Save staff (Add or Update)
//   const handleSave = async () => {
//     if (!form.name || !form.email || !form.phone) {
//       toast.error("Name, email, and phone are required");
//       return;
//     }

//     setSaving(true);
//     try {
//       if (editStaff) {
//         await axios.put(`/api/staff/${editStaff._id}`, form);
//         toast.success("Staff updated successfully");
//       } else {
//         await axios.post("/api/staff", form);
//         toast.success("Staff added successfully");
//       }
//       setForm({ name: "", email: "", phone: "", role: "staff", permissions: {} });
//       setEditStaff(null);
//       setOpen(false);
//       fetchStaff();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err?.response?.data?.error || "Failed to save staff");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Delete staff
//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this staff?")) return;
//     try {
//       await axios.delete(`/api/staff/${id}`);
//       setStaff((prev) => prev.filter((s) => s._id !== id));
//       toast.success("Staff deleted successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete staff");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold">Staff Management</h1>
//         <Button
//           onClick={() => {
//             setForm({ name: "", email: "", phone: "", role: "staff", permissions: {} });
//             setEditStaff(null);
//             setOpen(true);
//           }}
//         >
//           + Add Staff
//         </Button>
//       </div>

//       {/* Staff List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Staff Members</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p>Loading...</p>
//           ) : staff.length === 0 ? (
//             <p className="text-gray-500">No staff added yet.</p>
//           ) : (
//             <ul className="divide-y">
//               {staff.map((member) => (
//                 <li
//                   key={member._id}
//                   className="py-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <p className="font-medium">{member.name}</p>
//                     <p className="text-sm text-gray-500">
//                       {member.email || member.phone}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span
//                       className={`capitalize text-sm px-2 py-1 rounded ${
//                         member.role === "manager"
//                           ? "bg-blue-100 text-blue-800"
//                           : "bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       {member.role}
//                     </span>
//                     <Button size="sm" variant="outline" onClick={() => handleEdit(member._id)}>
//                       <Edit size={16} />
//                     </Button>
//                     <Button size="sm" variant="destructive" onClick={() => handleDelete(member._id)}>
//                       <Trash2 size={16} />
//                     </Button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>

//       {/* Add/Edit Staff Modal */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>{editStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <Input
//               placeholder="Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//             />
//             <Input
//               placeholder="Email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//             />
//             <Input
//               placeholder="Phone"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//             />

//             {/* Role */}
//             <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="staff">Staff</SelectItem>
//                 <SelectItem value="manager">Manager</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Permissions */}
//             <div className="grid grid-cols-2 gap-2">
//               {permissionList.map((perm) => (
//                 <label key={perm} className="flex items-center space-x-2 text-sm">
//                   <input
//                     type="checkbox"
//                     checked={form.permissions?.[perm] || false}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         permissions: { ...form.permissions, [perm]: e.target.checked },
//                       })
//                     }
//                   />
//                   <span className="capitalize">{perm.replace(/([A-Z])/g, " $1")}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave} disabled={saving}>
//               {saving ? "Saving..." : editStaff ? "Update" : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }







// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Trash2, Edit } from "lucide-react";
// import { toast } from "react-hot-toast";

// export default function StaffPage() {
//   const [staff, setStaff] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [open, setOpen] = useState(false);
//   const [editStaff, setEditStaff] = useState<any>(null);
//   const [saving, setSaving] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     role: "staff",
//     permissions: {} as Record<string, boolean>,
//   });

//   // 🔹 Added visibility permissions here
//   const permissionList = [
//     // "manageBusiness",
//     "manageStaff",
//     // "manageSubscription",
//     "manageProducts",
//     "manageSales",
//     "managePurchases",
//     "manageExpenses",
//     "viewReports",
//     "viewAmounts",          // NEW
//     "viewProfit",           // NEW
//     // "viewSensitiveReports", // NEW
//   ];

//   // Load all staff
//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   const fetchStaff = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axios.get("/api/staff");
//       setStaff(data || []);
//     } catch (err) {
//       console.error("Failed to load staff:", err);
//       toast.error("Failed to load staff");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Open edit modal and fetch latest staff data
//   const handleEdit = async (id: string) => {
//     try {
//       const { data } = await axios.get(`/api/staff/${id}`);
//       setForm({
//         name: data.name,
//         email: data.email,
//         phone: data.phone,
//         role: data.role,
//         permissions: data.permissions || {},
//       });
//       setEditStaff(data);
//       setOpen(true);
//     } catch (err) {
//       console.error("Failed to load staff:", err);
//       toast.error("Failed to load staff details");
//     }
//   };

//   // Save staff (Add or Update)
//   const handleSave = async () => {
//     if (!form.name || !form.email || !form.phone) {
//       toast.error("Name, email, and phone are required");
//       return;
//     }

//     setSaving(true);
//     try {
//       if (editStaff) {
//         await axios.put(`/api/staff/${editStaff._id}`, form);
//         toast.success("Staff updated successfully");
//       } else {
//         await axios.post("/api/staff", form);
//         toast.success("Staff added successfully");
//       }
//       setForm({ name: "", email: "", phone: "", role: "staff", permissions: {} });
//       setEditStaff(null);
//       setOpen(false);
//       fetchStaff();
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err?.response?.data?.error || "Failed to save staff");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Delete staff
//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this staff?")) return;
//     try {
//       await axios.delete(`/api/staff/${id}`);
//       setStaff((prev) => prev.filter((s) => s._id !== id));
//       toast.success("Staff deleted successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete staff");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-semibold">Staff Management</h1>
//         <Button
//           onClick={() => {
//             setForm({ name: "", email: "", phone: "", role: "staff", permissions: {} });
//             setEditStaff(null);
//             setOpen(true);
//           }}
//         >
//           + Add Staff
//         </Button>
//       </div>

//       {/* Staff List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Staff Members</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <p>Loading...</p>
//           ) : staff.length === 0 ? (
//             <p className="text-gray-500">No staff added yet.</p>
//           ) : (
//             <ul className="divide-y">
//               {staff.map((member) => (
//                 <li
//                   key={member._id}
//                   className="py-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <p className="font-medium">{member.name}</p>
//                     <p className="text-sm text-gray-500">
//                       {member.email || member.phone}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <span
//                       className={`capitalize text-sm px-2 py-1 rounded ${
//                         member.role === "manager"
//                           ? "bg-blue-100 text-blue-800"
//                           : "bg-gray-100 text-gray-800"
//                       }`}
//                     >
//                       {member.role}
//                     </span>
//                     <Button size="sm" variant="outline" onClick={() => handleEdit(member._id)}>
//                       <Edit size={16} />
//                     </Button>
//                     <Button size="sm" variant="destructive" onClick={() => handleDelete(member._id)}>
//                       <Trash2 size={16} />
//                     </Button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>

//       {/* Add/Edit Staff Modal */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>{editStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <Input
//               placeholder="Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//             />
//             <Input
//               placeholder="Email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//             />
//             <Input
//               placeholder="Phone"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//             />

//             {/* Role */}
//             <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="staff">Staff</SelectItem>
//                 <SelectItem value="manager">Manager</SelectItem>
//               </SelectContent>
//             </Select>

//             {/* Permissions */}
//             <div className="grid grid-cols-2 gap-2">
//               {permissionList.map((perm) => (
//                 <label key={perm} className="flex items-center space-x-2 text-sm">
//                   <input
//                     type="checkbox"
//                     checked={form.permissions?.[perm] || false}
//                     onChange={(e) =>
//                       setForm({
//                         ...form,
//                         permissions: { ...form.permissions, [perm]: e.target.checked },
//                       })
//                     }
//                   />
//                   <span className="capitalize">
//                     {perm
//                       .replace(/([A-Z])/g, " $1") // add spaces before caps
//                       .replace("view", "View ") // improve readability
//                       .replace("manage", "Manage ")}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave} disabled={saving}>
//               {saving ? "Saving..." : editStaff ? "Update" : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }







"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";

// 🔹 Permissions structure
const MODULES = [
  "business",
  "staff",
  "products",
  "sales",
  "purchases",
  "expenses",
  "reports",
  // "subscription",
] as const;

const ACTIONS_MAP: Record<string, string[]> = {
  business: ["create", "read", "update", "delete"],
  staff: ["create", "read", "update", "delete"],
  products: ["create", "read", "update", "delete"],
  sales: ["create", "read", "update", "delete"],
  purchases: ["create", "read", "update", "delete"],
  expenses: ["create", "read", "update", "delete"],
  reports: ["create", "read", "update", "delete"],
  // subscription: ["manage"],
};

const VISIBILITY = ["viewAmounts", "viewProfit", "viewSensitiveReports"];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    permissions: {} as Record<string, any>,
  });

  // Load all staff
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/staff");
      setStaff(data || []);
    } catch (err) {
      console.error("Failed to load staff:", err);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/staff/${id}`);
      setForm({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        permissions: data.permissions || {},
      });
      setEditStaff(data);
      setOpen(true);
    } catch (err) {
      console.error("Failed to load staff:", err);
      toast.error("Failed to load staff details");
    }
  };

  // Save staff
  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }

    setSaving(true);
    try {
      if (editStaff) {
        await axios.put(`/api/staff/${editStaff._id}`, form);
        toast.success("Staff updated successfully");
      } else {
        await axios.post("/api/staff", form);
        toast.success("Staff added successfully");
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "staff",
        permissions: {},
      });
      setEditStaff(null);
      setOpen(false);
      fetchStaff();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  // Delete staff
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff?")) return;
    try {
      await axios.delete(`/api/staff/${id}`);
      setStaff((prev) => prev.filter((s) => s._id !== id));
      toast.success("Staff deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete staff");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Staff Management</h1>
        <Button
          onClick={() => {
            setForm({
              name: "",
              email: "",
              phone: "",
              role: "staff",
              permissions: {},
            });
            setEditStaff(null);
            setOpen(true);
          }}
        >
          + Add Staff
        </Button>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : staff.length === 0 ? (
            <p className="text-gray-500">No staff added yet.</p>
          ) : (
            <ul className="divide-y">
              {staff.map((member) => (
                <li
                  key={member._id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">
                      {member.email || member.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`capitalize text-sm px-2 py-1 rounded ${
                        member.role === "manager"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.role}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(member._id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(member._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Staff Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editStaff ? "Edit Staff" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            {/* Role */}
            <Select
              value={form.role}
              onValueChange={(role) => setForm({ ...form, role })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>

            {/* Permissions */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto border rounded p-3">
              {MODULES.map((module) => (
                <div key={module}>
                  <p className="font-semibold capitalize">{module}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ACTIONS_MAP[module].map((action) => (
                      <label
                        key={action}
                        className="flex items-center space-x-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={
                            form.permissions?.[module]?.[action] || false
                          }
                          onChange={(e) =>
                            setForm({
                              ...form,
                              permissions: {
                                ...form.permissions,
                                [module]: {
                                  ...form.permissions[module],
                                  [action]: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                        <span className="capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Visibility */}
              <div className="mt-4">
                <p className="font-semibold">Visibility</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {VISIBILITY.map((field) => (
                    <label
                      key={field}
                      className="flex items-center space-x-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={
                          form.permissions?.visibility?.[field] || false
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            permissions: {
                              ...form.permissions,
                              visibility: {
                                ...form.permissions?.visibility,
                                [field]: e.target.checked,
                              },
                            },
                          })
                        }
                      />
                      <span className="capitalize">
                        {field.replace("view", "View ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editStaff ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
