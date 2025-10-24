


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Edit,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  CalendarCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

// 🔹 Type Definitions
type Module = (typeof MODULES)[number];
type Action = "create" | "read" | "purchaseprice" | "update" | "delete" | "manage";

type Permissions = {
  [M in Module]?: { [A in Action]?: boolean };
} & {
  visibility?: { [V in (typeof VISIBILITY)[number]]?: boolean };
};

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "staff" | "manager";
  permissions: Permissions;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  profileImageUrl?: string;
  dob?: string;
  address?: string;
  idProofType?: string;
  idProofUrl?: string;
  joiningDate?: string;
  jobType?: string;
  emergencyContact?: string;
}

interface Attendance {
  _id: string;
  staffId: string;
  date: string; // ISO string
  status: 'present' | 'absent' | 'leave';
  notes?: string;
}
// 🔹 Permissions structure
const MODULES = [
  // "business",
  // "staff",
  "parties",
  "products",
  "sales",
  "purchases",
  "expenses",
  "cashbook",
  "reports",
  "salesReturn",
  "purchasesReturn",
  // "subscription",
] as const;

const ACTIONS_MAP: Record<Module, Action[]> = {
  // business: ["create", "read", "update", "delete"],
  // staff: ["create", "read", "update", "delete"],
  parties: ["create", "read", "update", "delete"],
  products: ["create", "purchaseprice", "update", "delete"],
  sales: ["create", "read", "update", "delete"],
  purchases: ["create", "read", "update", "delete"],
  salesReturn: ["create", "read", "update", "delete"],
  purchasesReturn: ["create", "read", "update", "delete"],
  cashbook: ["create", "read", "update", "delete"],
  expenses: ["create", "read", "update", "delete"],
  reports: ["create", "read", "update", "delete"],
  // subscription: ["manage"],
};

const VISIBILITY = ["viewAmounts", "viewProfit", "viewSensitiveReports"];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // e.g., "2023-10"
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'leave'>('all');
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    leave: 0,
  });
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [isEditAttendanceOpen, setIsEditAttendanceOpen] = useState(false);
  const [editAttendanceForm, setEditAttendanceForm] = useState({
    status: "present" as "present" | "absent" | "leave",
    notes: "",
  });
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [bulkAttendanceForm, setBulkAttendanceForm] = useState({
    startDate: "",
    endDate: "",
    status: "present" as "present" | "absent" | "leave",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    permissions: {} as Permissions,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    profileImageUrl: "",
    dob: "",
    address: "",
    idProofType: "",
    idProofUrl: "",
    joiningDate: "",
    jobType: "",
    emergencyContact: "",
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);

  // Load all staff
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/staff");
      // The API returns { success: true, users: [...] }, so we need data.users
      const staffList: Staff[] = data.users || [];
      setStaff(staffList);

      if (selectedStaff) {
        const updatedSelected = staffList.find(s => s._id === selectedStaff._id);
        setSelectedStaff(updatedSelected || (staffList.length > 0 ? staffList[0] : null));
      } else if (staffList.length > 0) {
        setSelectedStaff(staffList[0]);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (staffId: string) => {
    if (!staffId || !filterMonth) return;
    setLoadingAttendance(true);
    try {
      const [year, month] = filterMonth.split('-');
      const { data } = await axios.get(`/api/staff/attendance`, {
        params: { staffId, year, month, status: filterStatus }
      });
      setAttendance(data.records || []);
      setAttendanceSummary(data.summary || { present: 0, absent: 0, leave: 0 });
    } catch (err) {
      console.error("Failed to load attendance:", err);
      setAttendance([]);
      setAttendanceSummary({ present: 0, absent: 0, leave: 0 });
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch attendance when a staff member is selected
  useEffect(() => {
    if (selectedStaff) { fetchAttendance(selectedStaff._id); }
  }, [selectedStaff, filterMonth, filterStatus]);

  const handleSelectStaff = useCallback(
    (staffMember: Staff) => {
      setSelectedStaff(staffMember);
    },
    []
  );

  // Open edit modal
  const handleEdit = (staffMember: Staff | null) => {
    if (!staffMember) return;
    // No need to fetch again, we have the data in selectedStaff
    setForm({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role as "staff" | "manager",
      permissions: staffMember.permissions ? JSON.parse(JSON.stringify(staffMember.permissions)) : {},
      bankName: staffMember.bankName || "",
      accountNumber: staffMember.accountNumber || "",
      ifscCode: staffMember.ifscCode || "",
      upiId: staffMember.upiId || "",
      profileImageUrl: staffMember.profileImageUrl || "",
      dob: staffMember.dob ? new Date(staffMember.dob).toISOString().split('T')[0] : "",
      address: staffMember.address || "",
      idProofType: staffMember.idProofType || "",
      idProofUrl: staffMember.idProofUrl || "",
      joiningDate: staffMember.joiningDate ? new Date(staffMember.joiningDate).toISOString().split('T')[0] : "",
      jobType: staffMember.jobType || "",
      emergencyContact: staffMember.emergencyContact || "",
    });
    setEditStaff(staffMember);
    setOpen(true);
  };

  

  const handlePermissionChange = (
    module: Module,
    action: string,
    checked: boolean
  ) => {
    setForm((prevForm) => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [module]: {
          ...prevForm.permissions[module],
          [action]: checked,
        },
      },
    }));
  };

  // Save staff
  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      // Append all form fields to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'permissions') {
          data.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          data.append(key, value as string);
        }
      });

      // Append files if they exist
      if (profileImageFile) {
        data.append("profileImage", profileImageFile);
      }
      if (idProofFile) {
        data.append("idProof", idProofFile);
      }

      if (editStaff) {
        // Update existing staff
        await axios.put(`/api/staff/${editStaff._id}`, data);
        toast.success("Staff updated successfully");
      } else {
        // Create new staff
        await axios.post("/api/staff", data);
        toast.success("Staff added successfully");
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "staff",
        permissions: {},
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        profileImageUrl: "",
        dob: "",
        address: "",
        idProofType: "",
        idProofUrl: "",
        joiningDate: "",
        jobType: "",
        emergencyContact: "",
      });
      setProfileImageFile(null);
      setIdProofFile(null);
      setProfileImagePreview(null);
      setIdProofPreview(null);
      setEditStaff(null);
      setOpen(false);
      // After saving, re-fetch and update the selected staff member
      fetchStaff();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAttendance = async (status: 'present' | 'absent' | 'leave') => {
    if (!selectedStaff) return;

    try {
      // The API now handles upserting, so we can just send the request.
      // Normalize the date to midnight to ensure all entries for the same day are treated as one.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await axios.post('/api/staff/attendance', { staffId: selectedStaff._id, status, date: today });
      toast.success(`Marked as ${status} for today.`);
      fetchAttendance(selectedStaff._id); // Refresh attendance list
    } catch (err) {
      toast.error("Failed to mark attendance.");
      console.error("Failed to mark attendance:", err);
    }
  };

  const handleOpenEditAttendance = (record: Attendance) => {
    setEditingAttendance(record);
    setEditAttendanceForm({
      status: record.status,
      notes: record.notes || "",
    });
    setIsEditAttendanceOpen(true);
  };

  const handleUpdateAttendance = async () => {
    if (!editingAttendance) return;
    try {
      await axios.put(`/api/staff/attendance/${editingAttendance._id}`, {
        status: editAttendanceForm.status,
        notes: editAttendanceForm.notes,
      });
      toast.success("Attendance record updated successfully.");
      setIsEditAttendanceOpen(false);
      setEditingAttendance(null);
      if (selectedStaff) {
        fetchAttendance(selectedStaff._id);
      }
    } catch (err) {
      toast.error("Failed to update attendance record.");
      console.error("Failed to update attendance:", err);
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await axios.delete(`/api/staff/attendance/${attendanceId}`);
        toast.success("Attendance record deleted.");
        if (selectedStaff) fetchAttendance(selectedStaff._id);
      } catch (err) {
        toast.error("Failed to delete attendance record.");
        console.error("Failed to delete attendance:", err);
      }
    }
  };
  const handleBulkMarkAttendance = async () => {
    if (!selectedStaff || !bulkAttendanceForm.startDate || !bulkAttendanceForm.endDate) {
      toast.error("Please select a valid date range.");
      return;
    }

    if (new Date(bulkAttendanceForm.startDate) > new Date(bulkAttendanceForm.endDate)) {
      toast.error("Start date cannot be after the end date.");
      return;
    }

    try {
      await axios.post('/api/staff/attendance', {
        staffId: selectedStaff._id,
        status: bulkAttendanceForm.status,
        startDate: bulkAttendanceForm.startDate,
        endDate: bulkAttendanceForm.endDate,
      });
      toast.success(`Attendance marked for the selected period.`);
      fetchAttendance(selectedStaff._id); // Refresh attendance list
      setIsBulkAttendanceOpen(false);
    } catch (err) {
      toast.error("Failed to mark attendance for the period.");
      console.error("Failed to mark attendance:", err);
    }
  };
  // Delete staff
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff?")) {
      try {
        await axios.delete(`/api/staff/${id}`);
        const newStaffList = staff.filter((s) => s._id !== id);
        setStaff(newStaffList);
        // If the deleted staff was selected, select the first one or null
        setSelectedStaff(newStaffList.length > 0 ? newStaffList[0] : null);
        toast.success("Staff deleted successfully");
      } catch (err) {
        console.error("Failed to delete staff:", err);
        toast.error("Failed to delete staff");
      }
    }
  };

  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 sm:p-6 border-b">
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
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                upiId: "",
                profileImageUrl: "",
                dob: "",
                address: "",
                idProofType: "",
                idProofUrl: "",
                joiningDate: "",
                jobType: "",
                emergencyContact: "",
              });
              setEditStaff(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="flex overflow-scroll h-full">
        {/* Staff List (Left Pane) */}
        <div className={`w-full  lg:w-1/3 ${selectedStaff ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <Card className="flex-1 flex flex-col m-4 sm:m-6 lg:m-0 lg:rounded-none lg:border-l-0 lg:border-t-0 lg:border-b-0 lg:border-r">
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                Select a staff member to view their details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
              <div className="mb-4 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="text-center text-gray-500 py-10">
                  Loading staff...
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchTerm ? "No staff found" : "No staff members yet"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "Try a different search term."
                      : "Get started by adding a new staff member."}
                  </p>
                </div>
              ) : (
                <div className="flex-1  overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                        <TableRow
                          key={member._id}
                          onClick={() => handleSelectStaff(member)}
                          className={`cursor-pointer ${
                            selectedStaff?._id === member._id
                              ? "bg-muted hover:bg-muted"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${
                                member.role === "manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {member.role}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Staff Details */}
        <div className={`w-full lg:w-2/3 ${selectedStaff ? 'flex' : 'hidden lg:flex'} flex-col`}>
          <Card className="flex-1 flex flex-col lg:rounded-none lg:border-t-0 lg:border-r-0 lg:border-b-0">
            {selectedStaff ? (
              <>
                <div className="p-4 border-b lg:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStaff(null)}
                    className="w-full justify-start"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to list
                  </Button>
                </div>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedStaff.name}
                    </CardTitle>
                    <CardDescription>{selectedStaff.email}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(selectedStaff)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(selectedStaff._id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-6 p-6 flex-1 overflow-y-auto">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedStaff.profileImageUrl || `https://ui-avatars.com/api/?name=${selectedStaff.name.replace(' ', '+')}&background=random`}
                      alt={selectedStaff.name}
                      className="h-20 w-20 rounded-full object-cover border"
                    />
                    <h3 className="text-2xl font-bold">{selectedStaff.name}</h3>
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold">Details</h4>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedStaff.phone}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Role:</span>{" "}
                      <span className="capitalize">{selectedStaff.role}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Date of Birth:</span>{" "}
                      {selectedStaff.dob ? new Date(selectedStaff.dob).toLocaleDateString() : 'N/A'}
                    </p>
                     <p className="text-sm">
                      <span className="text-muted-foreground">Joining Date:</span>{" "}
                      {selectedStaff.joiningDate ? new Date(selectedStaff.joiningDate).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Job Type:</span>{" "}
                      <span className="capitalize">{selectedStaff.jobType || 'N/A'}</span>
                    </p>
                     <p className="text-sm">
                      <span className="text-muted-foreground">Emergency Contact:</span>{" "}
                      {selectedStaff.emergencyContact || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Address:</span>{" "}
                      {selectedStaff.address || 'N/A'}
                    </p>
                  </div>

                  <Accordion type="multiple" className="w-full space-y-4">
                    <AccordionItem value="bank-details" className="border rounded-lg px-4">
                      <AccordionTrigger className="py-3">Bank & ID Details</AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-4">
                        {selectedStaff.bankName ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Bank Details</h4>
                            <p className="text-sm"><span className="text-muted-foreground">Bank:</span> {selectedStaff.bankName}</p>
                            <p className="text-sm"><span className="text-muted-foreground">Account No:</span> {selectedStaff.accountNumber}</p>
                            <p className="text-sm"><span className="text-muted-foreground">UPI ID:</span> {selectedStaff.upiId}</p>
                            <p className="text-sm"><span className="text-muted-foreground">IFSC:</span> {selectedStaff.ifscCode}</p>
                          </div>
                        ) : <p className="text-sm text-muted-foreground">No bank details provided.</p>}
                        <Separator/>
                        {selectedStaff.idProofUrl ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">ID Proof</h4>
                            <p className="text-sm capitalize"><span className="text-muted-foreground">Type:</span> {selectedStaff.idProofType}</p>
                            <a href={selectedStaff.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Document</a>
                          </div>
                        ) : <p className="text-sm text-muted-foreground">No ID proof provided.</p>}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="attendance" className="border rounded-lg px-4">
                      <AccordionTrigger className="py-3">Attendance History</AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div>
                            <Label htmlFor="filterMonth">Filter by Month</Label>
                            <Input id="filterMonth" type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full sm:w-[180px] mt-1" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                                <CalendarCheck className="mr-2 h-4 w-4" /> Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleMarkAttendance('present')}>Mark Today as Present</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkAttendance('absent')}>Mark Today as Absent</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkAttendance('leave')}>Mark Today as On Leave</DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem onClick={() => setIsBulkAttendanceOpen(true)}>Bulk Mark Attendance</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg"><p className="text-2xl font-bold text-green-600">{attendanceSummary.present}</p><p className="text-xs font-medium text-muted-foreground">Present</p></div>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</p><p className="text-xs font-medium text-muted-foreground">Absent</p></div>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-2xl font-bold text-yellow-600">{attendanceSummary.leave}</p><p className="text-xs font-medium text-muted-foreground">On Leave</p></div>
                        </div>
                        <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                          <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="present">Present</TabsTrigger><TabsTrigger value="absent">Absent</TabsTrigger><TabsTrigger value="leave">Leave</TabsTrigger></TabsList>
                        </Tabs>
                        {loadingAttendance ? <p className="text-sm text-muted-foreground text-center py-4">Loading history...</p> :
                          attendance.length > 0 ? (
                            <div className="border rounded-md max-h-60 overflow-y-auto">
                              <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                  {attendance.map(record => (
                                    <TableRow key={record._id}><TableCell>{new Date(record.date).toLocaleDateString()}</TableCell><TableCell><span className="capitalize">{record.status}</span></TableCell></TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No attendance records found for this filter.</p>
                          )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="permissions" className="border rounded-lg px-4">
                      <AccordionTrigger className="py-3">Permissions</AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="space-y-4">
                          {MODULES.map((module) => (
                            <div key={module}>
                              <p className="capitalize font-medium text-sm mb-2">{module}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {ACTIONS_MAP[module].map((action) => (
                                  <div key={action} className="flex items-center space-x-2">
                                    <CheckCircle2 className={`h-4 w-4 ${selectedStaff.permissions?.[module]?.[action as Action] ? "text-green-500" : "text-gray-300"}`} />
                                    <span className="text-sm capitalize">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div>
                            <p className="font-medium text-sm mb-2">Visibility</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {VISIBILITY.map((field) => (
                                <div key={field} className="flex items-center space-x-2">
                                  <CheckCircle2 className={`h-4 w-4 ${selectedStaff.permissions?.visibility?.[field] ? "text-green-500" : "text-gray-300"}`} />
                                  <span className="text-sm">{field.replace(/([A-Z])/g, " $1").trim()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <User className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Select a staff member
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a staff member from the list to see their details and
                  permissions.
                </p>
              </div>
            )}
          </Card>
        </div>
        
        
        </div>
      </main>

      {/* Add/Edit Staff Modal */}
      <Dialog open={open} onOpenChange={setOpen} >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editStaff ? "Edit Staff" : "Add New Staff"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to{" "}
              {editStaff ? "update the staff member" : "add a new staff member"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-4 -mr-4">
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Photo</Label>              
              {profileImagePreview && (
                <div className="mt-2 w-24 h-24 relative">
                  <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover rounded-full border" />
                </div>
              )}
              <Input 
                id="profileImage" 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setProfileImageFile(e.target.files[0]);
                  } else {
                    setProfileImageFile(null);
                  }
                }} 
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g. +1234567890"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(role) => setForm({ ...form, role })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    {/* <SelectItem value="manager">Manager</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St, Anytown" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select value={form.jobType} onValueChange={(jobType) => setForm({ ...form, jobType })}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" placeholder="e.g. +919876543210" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="idProofType">ID Proof Type</Label>
                <Select value={form.idProofType} onValueChange={(idProofType) => setForm({ ...form, idProofType })}>
                  <SelectTrigger id="idProofType">
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhar">Aadhar Card</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="voter-id">Voter ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idProof">Upload ID Proof</Label>
                {idProofPreview && (
                  <div className="mt-2 w-full h-32 relative">
                    <img src={idProofPreview} alt="ID Preview" className="w-full h-full object-contain rounded border" />
                  </div>
                )}
                {form.idProofUrl && form.idProofUrl.endsWith('.pdf') && !idProofFile && (
                   <a href={form.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 block">View Current PDF</a>
                )}
                <Input 
                  id="idProof" 
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIdProofFile(e.target.files[0]);
                    } else {
                      setIdProofFile(null);
                    }
                  }} 
                  className="mt-2"
                />
              </div>
            </div>

            {/* Permissions */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="bank-details">
                <AccordionTrigger>Bank Details (Optional)</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g. State Bank of India"
                        value={form.bankName}
                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="e.g. 1234567890"
                        value={form.accountNumber}
                        onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        placeholder="e.g. SBIN0001234"
                        value={form.ifscCode}
                        onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="e.g. username@upi"
                        value={form.upiId}
                        onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="permissions">
                <AccordionTrigger>Permissions</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-6 p-1 pr-3">
                    {MODULES.map((module) => (
                      <div key={module}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold capitalize">{module}</p>
                          <label className="flex items-center space-x-2 text-sm font-medium">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary rounded"
                              onChange={(e) => {
                                const allChecked = e.target.checked;
                                const modulePermissions = ACTIONS_MAP[
                                  module
                                ].reduce((acc, action) => {
                                  acc[action] = allChecked;
                                  return acc;
                                }, {} as Record<string, boolean>);

                                setForm((prevForm) => ({
                                  ...prevForm,
                                  permissions: {
                                    ...prevForm.permissions,
                                    [module]: modulePermissions,
                                  },
                                }));
                              }}
                              checked={
                                form.permissions?.[module] &&
                                ACTIONS_MAP[module].length > 0 &&
                                ACTIONS_MAP[module].every((action) =>
                                  !!form.permissions?.[module]?.[action as Action]
                                )
                              }
                            />
                            <span>Select All</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {ACTIONS_MAP[module].map((action) => (
                            <label
                              key={action}
                              className="flex items-center space-x-2 text-sm p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-primary rounded"
                                checked={
                                  form.permissions?.[module]?.[action] || false
                                }
                                onChange={(e) =>
                                  handlePermissionChange(
                                    module,
                                    action,
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="capitalize">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Visibility */}
                    <div className="mt-6">
                      <p className="font-semibold">Visibility</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {VISIBILITY.map((field) => (
                          <label
                            key={field}
                            className="flex items-center space-x-2 text-sm p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-primary rounded"
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
                              {field.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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

      {/* Bulk Attendance Modal */}
      <Dialog open={isBulkAttendanceOpen} onOpenChange={setIsBulkAttendanceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Mark Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for {selectedStaff?.name} for a date range. This will overwrite any existing records in this period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={bulkAttendanceForm.startDate} onChange={(e) => setBulkAttendanceForm({ ...bulkAttendanceForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={bulkAttendanceForm.endDate} onChange={(e) => setBulkAttendanceForm({ ...bulkAttendanceForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulkStatus">Status</Label>
              <Select
                value={bulkAttendanceForm.status}
                onValueChange={(status: "present" | "absent" | "leave") => setBulkAttendanceForm({ ...bulkAttendanceForm, status })}
              >
                <SelectTrigger id="bulkStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAttendanceOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkMarkAttendance}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Modal */}
      <Dialog open={isEditAttendanceOpen} onOpenChange={setIsEditAttendanceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Update the attendance record for {selectedStaff?.name} on {editingAttendance ? new Date(editingAttendance.date).toLocaleDateString() : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editAttendanceForm.status}
                onValueChange={(status: "present" | "absent" | "leave") => setEditAttendanceForm({ ...editAttendanceForm, status })}
              >
                <SelectTrigger id="editStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes (Optional)</Label>
              <Input id="editNotes" placeholder="e.g., Late arrival" value={editAttendanceForm.notes} onChange={(e) => setEditAttendanceForm({ ...editAttendanceForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAttendanceOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateAttendance}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
