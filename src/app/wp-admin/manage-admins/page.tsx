"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Mail, Phone, MapPin, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { getAdmins, deleteAdmin, updateAdmin } from './data';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import CardSkeleton from '@/components/ui/CardSkeleton';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

// Use the shared admins data store (getAdmins) instead of duplicating data here.

function AdminCard({ admin, onEdit, onDelete, onDeactivate }: { admin: any; onEdit: (id: string) => void; onDelete: (id: string) => void; onDeactivate: (id: string) => void }) {
  const initials = (() => {
    try {
      const n = (admin?.name || '').toString().trim();
      if (!n) return (admin?.email && admin.email[0]) ? admin.email[0].toUpperCase() : '?';
      const parts = n.split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } catch (e) { return '?'; }
  })();

  return (
  <Card className="bg-white shadow-md rounded-2xl hover:shadow-lg transition-shadow h-full flex flex-col py-0 border border-gray-200">
      <CardContent className="flex-1 flex flex-col justify-between px-4 pt-6 pb-4">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                {admin?.avatar ? (
                  <AvatarImage className="w-12 h-12" src={admin.avatar} alt={admin.name} />
                ) : (
                  <AvatarFallback className="w-12 h-12 text-sm font-medium">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="text-gray-900 font-semibold">{admin.name}</div>
                <div className="text-sm text-gray-500">{admin.store}</div>
              </div>
            </div>

            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-500 p-1 rounded-md hover:bg-gray-100">
                    <MoreVertical />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => onEdit(admin.id)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => window.location.assign(`/wp-admin/manage-admins/${admin.id}/details`)}>Details</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDeactivate(admin.id)}>Deactivate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onSelect={() => onDelete(admin.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail className="text-gray-400" /> <span>{admin.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="text-gray-400" /> <span>{admin.phone}</span></div>
            <div className="flex items-center gap-2"><MapPin className="text-gray-400" /> <span>{admin.location}</span></div>
          </div>
        </div>

  <div className="mt-auto border-t border-gray-100 flex items-center justify-between text-sm py-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{admin.status}</span>
            <span className={`${admin.plan === 'Premium' ? 'bg-yellow-100 text-yellow-800' : admin.plan === 'Standard' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'} px-2.5 py-1 rounded-full text-xs font-semibold`}>{admin.plan}</span>
          </div>
          <div className="text-gray-500">Joined: {new Date(admin.joined).toLocaleDateString('en-GB')}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddAdminCard({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition-colors cursor-pointer" onClick={onAdd}>
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-3">
          <Plus className="w-5 h-5" />
        </div>
        <div className="text-sm font-semibold text-gray-900">Add Admin</div>
        <div className="text-xs text-gray-500">Create a new admin account</div>
      </div>
    </div>
  );
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'Premium' | 'Standard' | 'Basic'>('all');
  const [items, setItems] = useState(() => getAdmins());
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  useEffect(() => {
    function onUpdate() { setItems(getAdmins()); }
    window.addEventListener('adminsUpdated', onUpdate as EventListener);
    // initial refresh from server
    (async () => {
      try {
        const { refreshAdmins } = await import('./data');
        setLoading(true);
        await refreshAdmins();
        setItems(getAdmins());
        setLoading(false);
      } catch (err) {
        console.error('failed to refresh admins', err);
      }
    })();
    return () => window.removeEventListener('adminsUpdated', onUpdate as EventListener);
  }, []);

  const filtered = useMemo(() => {
    return items.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (planFilter !== 'all' && a.plan !== planFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (a.name + ' ' + a.email + ' ' + a.store).toLowerCase().includes(q);
    });
  }, [items, query, statusFilter, planFilter]);

  return (
  <div className="flex flex-col min-h-0 h-full pt-0 pb-6">
      {/* Subheader: full-width filter bar aligned with main layout header */}
        <div className="md:sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b -mx-6 lg:-mx-8">
          <div className="px-6 lg:px-8 py-2 rounded-b-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3 w-full lg:flex-1">
              <Input className="w-full" value={query} onChange={(e: any) => setQuery(e.target.value)} placeholder="Search admins by name, email or store" />
            </div>

            <div className="flex items-center gap-4 justify-between w-full lg:w-auto">
              <div className="hidden md:flex items-center gap-3">
                <div className="text-sm text-gray-600">{filtered.length} admins</div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">Filters</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setStatusFilter(statusFilter === 'all' ? 'Active' : 'all')} className={`px-2.5 py-1 rounded-full text-sm border ${statusFilter === 'Active' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                  Active
                </button>
                <button onClick={() => setStatusFilter(statusFilter === 'Inactive' ? 'all' : 'Inactive')} className={`px-2.5 py-1 rounded-full text-sm border ${statusFilter === 'Inactive' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                  Inactive
                </button>
                <button onClick={() => setPlanFilter(planFilter === 'all' ? 'Premium' : 'all')} className={`px-2.5 py-1 rounded-full text-sm border ${planFilter === 'Premium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                  Premium
                </button>
                <button onClick={() => setPlanFilter(planFilter === 'Standard' ? 'all' : 'Standard')} className={`px-2.5 py-1 rounded-full text-sm border ${planFilter === 'Standard' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                  Standard
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Cards area: constrained height and scrollable so only cards scroll */}
      {loading ? (
        <div className="flex-1 overflow-auto pb-6 pt-4 md:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-fr items-stretch h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-6 text-center text-gray-500">No admins found. Try different search or filters.</div>
      ) : (
  <div className="flex-1 overflow-auto pb-6 pt-4 md:pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-fr items-stretch h-full">
            <AddAdminCard onAdd={() => router.push('/wp-admin/manage-admins/add')} />
            {filtered.map((a) => (
              <AdminCard key={a.id} admin={a} onEdit={(id) => router.push(`/wp-admin/manage-admins/${id}/edit`)} onDelete={(id) => setDeleteId(id)} onDeactivate={(id) => setDeactivateId(id)} />
            ))}
          </div>
        </div>
      )}
      {/* delete confirmation modal */}
      {deleteId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600">Are you sure you want to delete this admin?</p>
              <div className="mt-6 flex justify-end gap-3">
                <button className="px-3 py-2 bg-gray-100 rounded-md" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="px-3 py-2 bg-red-600 text-white rounded-md" onClick={() => { if (deleteId) deleteAdmin(deleteId); setDeleteId(null); }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* deactivate confirmation modal */}
      {deactivateId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeactivateId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deactivate</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setDeactivateId(null)}>✕</button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600">Are you sure you want to deactivate this admin?</p>
              <div className="mt-6 flex justify-end gap-3">
                <button className="px-3 py-2 bg-gray-100 rounded-md" onClick={() => setDeactivateId(null)}>Cancel</button>
                <button className="px-3 py-2 bg-yellow-600 text-white rounded-md" onClick={() => { if (deactivateId) updateAdmin(deactivateId, { status: 'Inactive' }); setDeactivateId(null); }}>Yes, Deactivate</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

