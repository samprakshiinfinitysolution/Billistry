"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdmins, updateAdmin, Admin } from "../manage-admins/data";
import { createPortal } from 'react-dom';

type SubUser = {
  id: string;
  businessName: string;
  place: string;
  status: 'active' | 'inactive' | string;
  planId: string;
  contact: string;
  email: string;
  businessType: string;
  createdAt: string;
};

const kpis = [
  { title: 'Total Subscribers', value: '12,430', change: '+4.2%', positive: true },
  { title: 'Monthly Revenue', value: '₹1,24,300', change: '+2.1%', positive: true },
  { title: 'Renewal Rate', value: '81%', change: '+1.3%', positive: true },
  { title: 'Churn Rate', value: '3.2%', change: '-0.4%', positive: false },
];

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹0',
    subs: 512,
    popular: false,
    features: [
      { name: 'Up to 100 invoices', included: true },
      { name: 'Email support', included: true },
      { name: 'Multi-store', included: false },
      { name: 'Advanced reports', included: false },
      { name: 'Mobile app access', included: true },
      { name: 'Single user account', included: true },
      { name: 'Basic analytics', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹499',
    subs: 4230,
    popular: true,
    features: [
      { name: 'Up to 2000 invoices', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Multi-store', included: true },
      { name: 'Advanced reports', included: false },
      { name: 'Custom invoice templates', included: true },
      { name: 'CSV export', included: true },
      { name: 'API access (limited)', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹999',
    subs: 5788,
    popular: false,
    features: [
      { name: 'Unlimited invoices', included: true },
      { name: 'Phone & priority support', included: true },
      { name: 'Multi-store', included: true },
      { name: 'Advanced reports', included: true },
      { name: 'API access', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom branding', included: true },
    ],
  },
];

function KPI({ kpi }: { kpi: any }) {
  return (
    <Card className="border border-gray-200">
      <CardContent>
        <div className="text-sm text-gray-500">{kpi.title}</div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-2xl font-semibold text-gray-900">{kpi.value}</div>
          <div className={`text-sm font-medium ${kpi.positive ? 'text-green-600' : 'text-red-500'}`}>
            {kpi.change} {kpi.positive && <TrendingUp className="inline-block ml-1 w-4 h-4 text-green-600" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingCard({ plan }: { plan: any }) {
  return (
    <div className={`rounded-2xl border ${plan.popular ? 'border-2 border-indigo-600' : 'border-gray-200'} bg-white shadow-sm overflow-hidden`}>
      {plan.popular && (
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white">
          <Star className="w-4 h-4" />
          <span className="text-xs font-semibold">Most Popular</span>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
            <div className="text-sm text-gray-500">{plan.subs} subscribers</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
            <div className="text-sm text-gray-500">/mo</div>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {plan.features.map((f: any) => (
            <li key={f.name} className="flex items-center gap-3 text-sm">
              {f.included ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`${!f.included ? 'line-through text-red-400' : 'text-gray-700'}`}>{f.name}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Button className="bg-violet-500 hover:bg-violet-600 text-white w-full">View More</Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {

  // use shared admins store (live)
  const [users, setUsers] = useState<SubUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const admins = getAdmins();
        if (!mounted) return;
        setUsers(admins.map(a => ({
          id: a.id,
          businessName: a.store || a.name,
          place: a.location || '',
          status: a.status.toLowerCase(),
          planId: a.plan.toLowerCase(),
          contact: a.phone || '',
          email: a.email || '',
          businessType: Array.isArray((a as any).businessTypes) ? (a as any).businessTypes.join(', ') : ((a as any).businessType || ''),
          createdAt: a.joined || ''
        })));
      } catch (err) {
        console.error('failed to load admins', err);
      } finally {
        setLoadingUsers(false);
      }
    })();
    return () => { mounted = false };
  }, []);
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // derive plans with status (active)
  const plansWithStatus = useMemo(() => {
    // attach a status field if missing
    return plans.map((p) => ({ ...p, status: (p as any).status || 'active' }));
  }, []);

  // helper to compute human-friendly age
  function formatAge(dateStr: string) {
    const d = new Date(dateStr);
    const ms = Date.now() - d.getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    return `${years}y`;
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (planFilter !== 'all' && u.planId !== planFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (search && !u.businessName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, planFilter, statusFilter, search]);

  const router = useRouter();
  const [planModalUser, setPlanModalUser] = useState<SubUser | null>(null);
  const [confirmUser, setConfirmUser] = useState<SubUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);

  const planCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    plans.forEach((p) => (counts[p.id] = 0));
    users.forEach((u) => { counts[u.planId] = (counts[u.planId] || 0) + 1; });
    return counts;
  }, [users]);

  function toggleUserStatus(id: string) {
    // update shared store
    const admin = getAdmins().find(a => a.id === id);
    if (!admin) return;
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    updateAdmin(id, { status: newStatus });
    // local update will be refreshed by adminsUpdated event
  }

  function changeUserPlan(userId: string, newPlanId: string) {
    // change plan in shared admin store
    const admin = getAdmins().find(a => a.id === userId);
    if (!admin) return;
    // map plan id to plan name casing used in admin store
  const planName = plans.find(p => p.id === newPlanId)?.name || newPlanId;
  updateAdmin(userId, { plan: planName as Admin['plan'] });
  }

  // subscribe to shared admin updates
  React.useEffect(() => {
    async function onUpdate() {
      const admins = getAdmins();
      setUsers(admins.map(a => ({
        id: a.id,
        businessName: a.store || a.name,
        place: a.location || '',
        status: a.status.toLowerCase(),
        planId: a.plan.toLowerCase(),
        contact: a.phone || '',
        email: a.email || '',
        businessType: Array.isArray((a as any).businessTypes) ? (a as any).businessTypes.join(', ') : ((a as any).businessType || ''),
        createdAt: a.joined || ''
      })));
    }
    window.addEventListener('adminsUpdated', onUpdate as EventListener);
    return () => window.removeEventListener('adminsUpdated', onUpdate as EventListener);
  }, []);

  return (
    <div className="flex flex-col min-h-0 h-full pt-0 pb-6">

      <div className="space-y-6 pt-6 px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <KPI key={k.title} kpi={k} />
          ))}
        </div>

        {/* Subscriptions overview: Plans and Users list */}
        <div className="mt-4">
          {/* Single Subscribers panel with filters */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Subscribers</h3>
                  <div className="text-sm text-gray-500">Total: {users.length} — Showing: {filteredUsers.length}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input placeholder="Search business" value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm border rounded px-2 py-1" />
                  <div>
                    <Select value={planFilter} onValueChange={(val) => setPlanFilter(val)}>
                      <SelectTrigger className="h-9 text-sm min-w-[10rem]" aria-label="Filter by plan">
                        <SelectValue placeholder="All plans" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All plans</SelectItem>
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                      <SelectTrigger className="h-9 text-sm w-40" aria-label="Filter by status">
                        <SelectValue placeholder="All status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-500">Business</TableHead>
                    <TableHead className="text-gray-500">Contact</TableHead>
                    <TableHead className="text-gray-500">Email</TableHead>
                    <TableHead className="text-gray-500">Place</TableHead>
                    <TableHead className="text-gray-500">Type</TableHead>
                    <TableHead className="text-gray-500">Status</TableHead>
                    <TableHead className="text-gray-500">Age</TableHead>
                    <TableHead className="text-gray-500">Plan</TableHead>
                    <TableHead className="text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.businessName}</TableCell>
                      <TableCell>{u.contact}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.place}</TableCell>
                      <TableCell>{u.businessType}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-sm ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatAge(u.createdAt)}</TableCell>
                      <TableCell>
                        <div className="text-sm px-2 py-1 rounded bg-gray-50">{plans.find(p => p.id === u.planId)?.name || u.planId}</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="p-1">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => router.push(`/wp-admin/manage-admins/${u.id}/edit`)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setPlanModalUser(u)}>Change plan</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => { setConfirmUser(u); setConfirmAction(u.status === 'active' ? 'deactivate' : 'activate'); }}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
        {/* Plan change modal */}
        {planModalUser && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setPlanModalUser(null)} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-visible z-50">
              <div className="flex items-center justify-between px-6 py-5 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Change Plan — {planModalUser.businessName}</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setPlanModalUser(null)}>✕</button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Plan</label>
                    <Select defaultValue={planModalUser.planId} onValueChange={(val) => setPlanModalUser(u => u ? ({ ...u, planId: val }) : u)}>
                      <SelectTrigger className="w-full text-left" aria-label="Select plan">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent className="z-[10001]">
                        {plans.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-100 rounded-md" onClick={() => setPlanModalUser(null)}>Cancel</button>
                    <button className="px-4 py-2 bg-violet-600 text-white rounded-md" onClick={() => { if (planModalUser) { changeUserPlan(planModalUser.id, planModalUser.planId); setPlanModalUser(null); } }}>Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>, document.body)
        }

        {/* Activate/Deactivate confirmation modal */}
        {confirmUser && confirmAction && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => { setConfirmUser(null); setConfirmAction(null); }} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-visible z-50">
              <div className="flex items-center justify-between px-6 py-5 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Confirm {confirmAction === 'activate' ? 'Activate' : 'Deactivate'}</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => { setConfirmUser(null); setConfirmAction(null); }}>✕</button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600">Are you sure you want to {confirmAction} <strong>{confirmUser.businessName}</strong>?</p>
                <div className="mt-6 flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-100 rounded-md" onClick={() => { setConfirmUser(null); setConfirmAction(null); }}>Cancel</button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-md" onClick={() => { if (confirmUser) toggleUserStatus(confirmUser.id); setConfirmUser(null); setConfirmAction(null); }}>{confirmAction === 'activate' ? 'Activate' : 'Deactivate'}</button>
                </div>
              </div>
            </div>
          </div>, document.body)
        }
    </div>
  );
}
