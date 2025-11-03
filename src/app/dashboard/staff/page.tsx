


"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
import TableSkeleton from '@/components/ui/TableSkeleton';
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
  X,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Calendar,
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

const ID_PROOF_LABELS: Record<string, string> = {
  aadhar: "Aadhar Card",
  pan: "PAN Card",
  passport: "Passport",
  "voter-id": "Voter ID",
};

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

  // When ID proof type is cleared, remove any selected file/preview to avoid orphaned uploads
  useEffect(() => {
    if (!form.idProofType) {
      setIdProofFile(null);
      setIdProofPreview(null);
    }
  }, [form.idProofType]);

  // Create a preview URL for locally selected ID proof files (images) so Add flow shows a preview
  useEffect(() => {
    let objectUrl: string | null = null;
    if (idProofFile) {
      if (idProofFile.type.startsWith("image/")) {
        objectUrl = URL.createObjectURL(idProofFile);
        setIdProofPreview(objectUrl);
      } else {
        // PDF: no inline preview
        setIdProofPreview(null);
      }
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [idProofFile]);
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Lightbox for full image preview
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Controlled open state for the details accordions so we can programmatically open and scroll
  const [detailsOpen, setDetailsOpen] = useState<string[]>([]);
  const detailsOpenRef = useRef<string[]>([]);
  const detailsContainerRef = useRef<HTMLDivElement | null>(null);

  // Edit modal accordion control & refs
  const [editDetailsOpen, setEditDetailsOpen] = useState<string | undefined>(undefined);
  const editDetailsOpenRef = useRef<string | undefined>(undefined);
  const editDetailsContainerRef = useRef<HTMLDivElement | null>(null);
  // Modal (Add/Edit) details scrolling
  const [modalDetailsOpen, setModalDetailsOpen] = useState<string[]>([]);
  const modalDetailsOpenRef = useRef<string[]>([]);
  const modalDetailsContainerRef = useRef<HTMLDivElement | null>(null);

  const openLightbox = (url: string) => {
    setLightboxUrl(url);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxUrl(null);
  };

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
    // Show existing profile/id proof previews when editing
    setProfileImagePreview(staffMember.profileImageUrl || null);
    setIdProofPreview(staffMember.idProofUrl || null);
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

  const setModuleAll = (module: Module, checked: boolean) => {
    const modulePermissions = ACTIONS_MAP[module].reduce((acc, action) => {
      acc[action] = checked;
      return acc;
    }, {} as Record<string, boolean>);

    setForm((prevForm) => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [module]: modulePermissions,
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
    // Prevent uploading ID proof without a selected ID proof type
    if (idProofFile && !form.idProofType) {
      toast.error("Please select an ID proof type before uploading the ID proof.");
      setSaving(false);
      return;
    }
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
  // Open delete confirmation dialog for a staff member
  const openDeleteDialog = (id: string, name?: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name || staff.find((s) => s._id === id)?.name || null);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return; // prevent closing while deleting
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetName(null);
  };

  // Perform the deletion after confirmation
  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/staff/${deleteTargetId}`);
      const newStaffList = staff.filter((s) => s._id !== deleteTargetId);
      setStaff(newStaffList);
      // If the deleted staff was selected, select the first one or null
      setSelectedStaff(newStaffList.length > 0 ? newStaffList[0] : null);
      toast.success("Staff deleted successfully");
      closeDeleteDialog();
    } catch (err) {
      console.error("Failed to delete staff:", err);
      toast.error("Failed to delete staff");
    } finally {
      setDeleting(false);
    }
  };

  // Backwards-compatible handleDelete: open dialog when called
  const handleDelete = (id: string) => openDeleteDialog(id);

  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  return (
    <div className=" flex flex-col h-screen overflow-hidden">
  <header className=" p-3 sm:p-4 border-b bg-white/50 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Staff Management</h1>
            <p className="text-sm text-gray-500">Manage staff, attendance and permissions</p>
          </div>
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
              // clear previews for new staff
              setProfileImagePreview(null);
              setIdProofPreview(null);
              setOpen(true);
            }}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="flex h-full min-h-0">
        {/* Staff List (Left Pane) - Removed sticky and explicit height for better flexbox handling */}
  <div className={`w-full lg:w-1/3 ${selectedStaff ? 'hidden lg:flex' : 'flex'} flex-col lg:flex-shrink-0`}>
          <Card className=" flex-1 flex flex-col m-4  sm:m-6 lg:m-0 lg:rounded-none lg:border-l-0 lg:border-t-0 lg:border-b-0 lg:border-r h-full">
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                Select a staff member to view their details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10 w-full bg-gray-50 text-gray-800 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading ? ( 
                <div className="p-2">
                  <TableSkeleton rows={6} />
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
                <div className="flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredStaff.map((member) => {
                      const active = selectedStaff?._id === member._id;
                      return (
                        <button
                          key={member._id}
                          onClick={() => handleSelectStaff(member)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <img
                            src={member.profileImageUrl || `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random`}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover border"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.email}</div>
                              </div>
                              <div>
                                <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${member.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {member.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Staff Details */}
        <div className={`w-full lg:w-2/3 ${selectedStaff ? 'flex' : 'hidden lg:flex'} flex-col min-h-0`}>
          <Card className="gap-0 py-0  flex-1 flex flex-col lg:rounded-none lg:border-t-0 lg:border-r-0 lg:border-b-0 min-h-0">
            {selectedStaff ? (
              <>
                <div className="p-2 border-b lg:hidden">
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
                <CardHeader className="flex flex-row items-center justify-between pt-4 pb-0 px-3 bg-white dark:bg-slate-800/60 border-b">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedStaff.profileImageUrl || `https://ui-avatars.com/api/?name=${selectedStaff.name.replace(' ', '+')}&background=random`}
                      alt={selectedStaff.name}
                      className="h-12 w-12 rounded-full object-cover border ring-1 ring-gray-100 dark:ring-700"
                    />
                    <div>
                      <CardTitle className="text-2xl leading-tight flex items-center gap-3">
                        {selectedStaff.name}
                        <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full border ${selectedStaff.role === 'manager' ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-gray-50 text-gray-800 border-gray-100'}`}>
                          {selectedStaff.role}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300">{selectedStaff.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Simple, visible quick actions - no three-dot menu */}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(selectedStaff)} className="inline-flex items-center gap-2">
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openDeleteDialog(selectedStaff._id, selectedStaff.name)} className="inline-flex items-center gap-2 text-red-600 bg-white dark:bg-slate-800 border border-red-100 hover:bg-red-50">
                      <Trash2 className="mr-1 h-4 w-4 text-red-500" /> Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent ref={detailsContainerRef} className="space-y-6 p-4 flex-1 overflow-y-auto pb-12">
                  {/* Quick section nav — sticky on scroll */}
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left: Contact card */}
                    <div className="bg-white dark:bg-slate-800/60 border rounded-md p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <p className="text-sm font-semibold">Contact</p>
                        </div>
                        <p className="mt-3 text-lg font-medium">{selectedStaff.phone || 'N/A'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedStaff.email || 'N/A'}</p>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-1">Emergency</p>
                        <p className="font-medium">{selectedStaff.emergencyContact || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Right: smaller info tiles */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-800/60 border rounded-md p-3 flex items-start gap-3">
                        <div className="pt-1"><Briefcase className="h-5 w-5 text-gray-500" /></div>
                        <div>
                          <p className="text-xs text-gray-500">Job</p>
                          <p className="font-medium">{selectedStaff.jobType || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground mt-1">Joined: {selectedStaff.joiningDate ? new Date(selectedStaff.joiningDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/60 border rounded-md p-3 flex items-start gap-3">
                        <div className="pt-1"><Calendar className="h-5 w-5 text-gray-500" /></div>
                        <div>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                          <p className="font-medium">{selectedStaff.dob ? new Date(selectedStaff.dob).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/60 border rounded-md p-3 flex items-start gap-3">
                        <div className="pt-1"><User className="h-5 w-5 text-gray-500" /></div>
                        <div>
                          <p className="text-xs text-gray-500">Role</p>
                          <p className="font-medium capitalize">{selectedStaff.role}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/60 border rounded-md p-3 flex items-start gap-3">
                        <div className="pt-1"><MapPin className="h-5 w-5 text-gray-500" /></div>
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="font-medium">{selectedStaff.address || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/60 border rounded-md p-3 flex items-start gap-3 sm:col-span-2">
                        <div className="pt-1"><FileText className="h-5 w-5 text-gray-500" /></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">ID Proof</p>
                          <p className="font-medium">{(selectedStaff.idProofType && ID_PROOF_LABELS[selectedStaff.idProofType]) || 'N/A'}</p>
                          {selectedStaff.idProofUrl && !selectedStaff.idProofUrl.endsWith('.pdf') && (
                            <div className="mt-2">
                              <button onClick={() => selectedStaff.idProofUrl && openLightbox(selectedStaff.idProofUrl)} className="inline-block cursor-pointer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={selectedStaff.idProofUrl} alt="ID" className="h-20 object-contain rounded border cursor-pointer" />
                              </button>
                            </div>
                          )}
                          {selectedStaff.idProofUrl && selectedStaff.idProofUrl.endsWith('.pdf') && (
                            <a href={selectedStaff.idProofUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-2 block">View PDF</a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Accordion type="multiple" value={detailsOpen} onValueChange={(v) => {
                    const newArr = Array.isArray(v) ? v : [v];
                    // detect newly opened sections compared to previous
                    const added = newArr.filter(x => !detailsOpenRef.current.includes(x));
                    setDetailsOpen(newArr);
                    detailsOpenRef.current = newArr;
                    if (added.length > 0) {
                      const id = added[0];
                      // scroll the newly opened section into view after a short delay so the content has expanded
                      setTimeout(() => {
                        const el = document.getElementById(id);
                        const container = detailsContainerRef.current;
                        if (!el) return;
                        // If we have a scrollable container, scroll inside it with an offset to account for headers
                        if (container) {
                          const containerRect = container.getBoundingClientRect();
                          const elRect = el.getBoundingClientRect();
                          // desired distance from top of container (px)
                          const topOffset = 48; // leaves some breathing room below any sticky headers
                          const scrollTop = container.scrollTop + (elRect.top - containerRect.top) - topOffset;
                          container.scrollTo({ top: scrollTop, behavior: 'smooth' });
                        } else {
                          // fallback
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 220);
                    }
                  }} className="w-full space-y-4 ">
                    <AccordionItem id="bank-details" value="bank-details" className="border rounded-lg overflow-hidden">
                      <AccordionTrigger className="py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 px-4 font-semibold text-sm cursor-pointer">Bank & ID Details</AccordionTrigger>
                      <AccordionContent className="pt-4 pb-4 px-4 bg-white dark:bg-slate-900/50 border-t space-y-4">
                        {selectedStaff.bankName ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Bank Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Bank</p>
                                <p className="font-medium">{selectedStaff.bankName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Account Number</p>
                                <p className="font-medium">{selectedStaff.accountNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">IFSC</p>
                                <p className="font-medium">{selectedStaff.ifscCode}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">UPI ID</p>
                                <p className="font-medium">{selectedStaff.upiId}</p>
                              </div>
                            </div>
                          </div>
                        ) : <p className="text-sm text-muted-foreground">No bank details provided.</p>}
                        <Separator/>
                        {selectedStaff.idProofUrl ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">ID Proof</h4>
                            <p className="text-sm"><span className="text-muted-foreground">Type:</span> {(selectedStaff.idProofType && ID_PROOF_LABELS[selectedStaff.idProofType]) || 'N/A'}</p>
                            {selectedStaff.idProofUrl.endsWith('.pdf') ? (
                              <a href={selectedStaff.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View PDF</a>
                            ) : (
                              <div className="mt-2">
                                <button onClick={(e) => { e.preventDefault(); if (selectedStaff.idProofUrl) openLightbox(selectedStaff.idProofUrl); }} className="inline-block group cursor-pointer">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={selectedStaff.idProofUrl} alt="ID Proof" className="max-h-40 w-auto object-contain rounded border transition-shadow group-hover:shadow-lg cursor-pointer" />
                                </button>
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground">Click image to enlarge</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : <p className="text-sm text-muted-foreground">No ID proof provided.</p>}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="attendance" value="attendance" className="border rounded-lg overflow-hidden">
                      <AccordionTrigger className="py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 px-4 font-semibold text-sm cursor-pointer">Attendance History</AccordionTrigger>
                      <AccordionContent className="pt-4 pb-4 px-4 bg-white dark:bg-slate-900/50 border-t space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div>
                            <Label htmlFor="filterMonth">Filter by Month</Label>
                            <Input id="filterMonth" type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full sm:w-[180px] mt-1" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="mt-2 sm:mt-0 cursor-pointer">
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
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all" className="cursor-pointer">All</TabsTrigger>
                            <TabsTrigger value="present" className="cursor-pointer">Present</TabsTrigger>
                            <TabsTrigger value="absent" className="cursor-pointer">Absent</TabsTrigger>
                            <TabsTrigger value="leave" className="cursor-pointer">Leave</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        {loadingAttendance ? (
                          <div className="p-2"><TableSkeleton rows={4} /></div>
                        ) : attendance.length > 0 ? (
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
                            <div className="flex flex-col items-center justify-center py-6">
                              <CalendarCheck className="h-12 w-12 text-gray-300 dark:text-slate-600" />
                              <h4 className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">No attendance records</h4>
                              <p className="mt-1 text-xs text-muted-foreground text-center">No records found for this filter. Try changing the month or status filters.</p>
                            </div>
                          )}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="permissions" value="permissions" className=" border rounded-lg overflow-hidden">
                      <AccordionTrigger className="py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 px-4 font-semibold text-sm cursor-pointer">Permissions</AccordionTrigger>
                      <AccordionContent className="pt-4 pb-4 px-4 bg-white dark:bg-slate-900/50 border-t">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MODULES.map((module) => {
                              const modulePerms = (selectedStaff.permissions && (selectedStaff.permissions as any)[module]) || {};
                              const enabledCount = Object.values(modulePerms).filter(Boolean).length;
                              return (
                                <div key={module} className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-900/40">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="capitalize font-semibold text-sm">{module}</p>
                                      <p className="text-xs text-muted-foreground">{enabledCount} enabled</p>
                                    </div>
                                    <div className="text-sm">
                                      {/* read-only indicator */}
                                      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/60 dark:bg-slate-800 border text-xs">
                                        <Users className="h-4 w-4 text-gray-500" />
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {ACTIONS_MAP[module].map((action) => {
                                      const enabled = !!modulePerms[action as Action];
                                      return (
                                        <span key={action} className={`text-xs px-3 py-1 rounded-full font-medium ${enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>
                                          {action}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="border rounded-lg p-3 bg-white dark:bg-slate-900/40">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">Visibility</p>
                                <p className="text-xs text-muted-foreground">Quick visibility toggles</p>
                              </div>
                              <div className="text-sm text-muted-foreground">Flags</div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {VISIBILITY.map((field) => (
                                <div key={field} className="flex items-center justify-between p-2 rounded-md border bg-gray-50 dark:bg-slate-900/50">
                                  <div>
                                    <p className="text-sm">{field.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-xs text-muted-foreground">{((selectedStaff.permissions && (selectedStaff.permissions as any).visibility && (selectedStaff.permissions as any).visibility[field]) ? 'Visible' : 'Hidden')}</p>
                                  </div>
                                  <div>
                                    <span className={`${(selectedStaff.permissions && (selectedStaff.permissions as any).visibility && (selectedStaff.permissions as any).visibility[field]) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'} text-xs px-2 py-1 rounded-full`}>{(selectedStaff.permissions && (selectedStaff.permissions as any).visibility && (selectedStaff.permissions as any).visibility[field]) ? 'On' : 'Off'}</span>
                                  </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) closeDeleteDialog(); else setDeleteDialogOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete staff</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteTargetName ? <strong className="capitalize">{deleteTargetName}</strong> : 'this staff member'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2" />
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog} disabled={deleting}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteConfirmed} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Staff Modal */}
      <Dialog open={open} onOpenChange={setOpen} >
  <DialogContent className="max-w-4xl sm:max-w-6xl md:max-w-4xl w-full mx-auto max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editStaff ? "Edit Staff" : "Add New Staff"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to{" "}
              {editStaff ? "update the staff member" : "add a new staff member"}.
            </DialogDescription>
          </DialogHeader>

          <div ref={modalDetailsContainerRef} className="space-y-3 py-1 flex-1 overflow-y-auto pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center md:items-start">
                <Label htmlFor="profileImage">Profile Photo</Label>
                {profileImagePreview ? (
                  <div className="mt-2 w-24 h-24 relative">
                    <button onClick={() => profileImagePreview && openLightbox(profileImagePreview)} className="w-full h-full rounded-full overflow-hidden inline-flex items-center justify-center cursor-pointer">
                      <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover rounded-full border cursor-pointer" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 w-24 h-24 rounded-full bg-gray-50 dark:bg-slate-800 border flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
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
                  className="mt-2 w-full cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">PNG/JPG recommended • 400×400</p>
                <p className="text-xs text-muted-foreground mt-1">{profileImageFile?.name ?? (profileImagePreview ? 'Using existing image' : 'No file chosen')}</p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name <span className="text-red-600">*</span></Label>
                    <Input
                      id="name"
                      placeholder="e.g. John Doe"
                      value={form.name}
                      aria-required
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-600">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={form.email}
                      aria-required
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-red-600">*</span></Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +1234567890"
                      value={form.phone}
                      aria-required
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(role) => setForm({ ...form, role })}
                    >
                      <SelectTrigger id="role" className="cursor-pointer bg-white dark:bg-slate-800">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        {/* <SelectItem value="manager">Manager</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                  <SelectTrigger id="jobType" className="cursor-pointer">
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
                  <SelectTrigger id="idProofType" className="cursor-pointer">
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
                <Label htmlFor="idProof">Upload ID Proof{(idProofPreview || form.idProofUrl) ? (
                  <span className="text-xs text-muted-foreground"> &nbsp; (Click to enlarge)</span>
                ) : null}</Label>
                {idProofPreview && (
                  <div className="mt-2 w-full h-32 relative">
                    <button onClick={() => idProofPreview && openLightbox(idProofPreview)} className="w-full h-full inline-block cursor-pointer">
                      <img src={idProofPreview} alt="ID Preview" className="w-full h-full object-contain rounded border cursor-pointer" />
                    </button>
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
                  className={`mt-2 ${!form.idProofType ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={!form.idProofType}
                  title={!form.idProofType ? 'Select ID proof type first' : undefined}
                />
                <p className="text-xs text-muted-foreground mt-1">{idProofFile?.name ?? (form.idProofUrl ? 'Using existing file' : 'No file chosen')}</p>
                {/* caption moved into label when editing */}
                {!form.idProofType && (
                  <p className="text-xs text-muted-foreground mt-2">Select ID proof type to enable upload</p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <Accordion type="single" collapsible value={modalDetailsOpen[0]} onValueChange={(v) => {
              const newArr = v ? [v] : [];
              const added = newArr.filter(x => !modalDetailsOpenRef.current.includes(x));
              setModalDetailsOpen(newArr);
              modalDetailsOpenRef.current = newArr;
              if (added.length > 0) {
                const id = added[0];
                setTimeout(() => {
                  const el = document.getElementById(id);
                  const container = modalDetailsContainerRef.current;
                  if (el && container) {
                    const containerRect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    const topOffset = 24;
                    const scrollTop = container.scrollTop + (elRect.top - containerRect.top) - topOffset;
                    container.scrollTo({ top: scrollTop, behavior: 'smooth' });
                  } else if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 180);
              }
            }} className="w-full">
              <AccordionItem id="bank-details-modal" value="bank-details-modal" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 px-4 font-semibold text-sm">Bank Details (Optional)</AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 px-4 bg-white dark:bg-slate-900/50 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Accordion
              type="single"
              collapsible
              value={modalDetailsOpen[0]}
              onValueChange={(v) => {
                const newArr = v ? [v] : [];
                const added = newArr.filter(x => !modalDetailsOpenRef.current.includes(x));
                setModalDetailsOpen(newArr);
                modalDetailsOpenRef.current = newArr;
                if (added.length > 0) {
                  const id = added[0];
                  setTimeout(() => {
                    const el = document.getElementById(id);
                    const container = modalDetailsContainerRef.current;
                    if (el && container) {
                      const containerRect = container.getBoundingClientRect();
                      const elRect = el.getBoundingClientRect();
                      const topOffset = 24;
                      const scrollTop = container.scrollTop + (elRect.top - containerRect.top) - topOffset;
                      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
                    } else if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 180);
                }
              }}
              className="w-full"
            >
              <AccordionItem id="permissions-modal" value="permissions-modal" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 px-4 font-semibold text-sm">Permissions</AccordionTrigger>
                <AccordionContent className="pt-4 pb-4 px-4 bg-white dark:bg-slate-900/50 border-t">
                  <div className="space-y-4">
                    {MODULES.map((module) => {
                      const allEnabled =
                        form.permissions?.[module] &&
                        ACTIONS_MAP[module].length > 0 &&
                        ACTIONS_MAP[module].every((action) => !!form.permissions?.[module]?.[action as Action]);

                      return (
                        <div key={module} className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold capitalize">{module}</p>
                              <p className="text-xs text-muted-foreground">{ACTIONS_MAP[module].length} actions</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setModuleAll(module as Module, true)}
                                className="text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() => setModuleAll(module as Module, false)}
                                className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {ACTIONS_MAP[module].map((action) => {
                              const enabled = !!form.permissions?.[module]?.[action];
                              return (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => handlePermissionChange(module as Module, action, !enabled)}
                                  aria-pressed={enabled}
                                  className={`text-sm px-3 py-1 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 cursor-pointer ${enabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                                >
                                  {action}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Visibility */}
                    <div className="mt-6">
                      <p className="font-semibold">Visibility</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {VISIBILITY.map((field) => {
                          const enabled = form.permissions?.visibility?.[field] || false;
                          return (
                            <div key={field} className="flex items-center justify-between p-2 rounded-md border bg-gray-50 dark:bg-slate-900/50">
                              <div>
                                <p className="text-sm">{field.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-xs text-muted-foreground">{enabled ? 'Visible' : 'Hidden'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setForm({
                                  ...form,
                                  permissions: {
                                    ...form.permissions,
                                    visibility: {
                                      ...form.permissions?.visibility,
                                      [field]: !enabled,
                                    },
                                  },
                                })}
                                className={`${enabled ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'} text-xs px-3 py-1 rounded-full cursor-pointer`}
                              >
                                {enabled ? 'On' : 'Off'}
                              </button>
                            </div>
                          );
                        })}
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
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700">
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
                <SelectTrigger id="bulkStatus" className="cursor-pointer">
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
                <SelectTrigger id="editStatus" className="cursor-pointer">
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
      {/* Lightbox / Full Image Preview */}
      <Dialog open={lightboxOpen} onOpenChange={(open) => { if (!open) closeLightbox(); else setLightboxOpen(open); }}>
        <DialogContent className="max-w-6xl w-full p-0 bg-transparent">
          <div className="relative bg-white dark:bg-slate-900 rounded">
            <button
              aria-label="Close"
              onClick={closeLightbox}
              className="absolute top-3 right-3 z-20 inline-flex items-center justify-center p-2 bg-black/60 rounded-full hover:bg-black/70 shadow-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="p-4 flex items-center justify-center">
              {lightboxUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lightboxUrl} alt="Full ID Proof" className="max-h-[80vh] w-auto object-contain" />
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">No image to display.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
