"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdmins, refreshAdmins } from '@/app/wp-admin/manage-admins/data';

type Recipient = {
  id: string;
  name: string;
  email: string;
  status: string;
  planId: string;
};

export default function NotificationsSendPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRecipients(true);
        // Fetch admins from the API
        const admins = await refreshAdmins();
        if (!mounted) return;
        setRecipients(admins.map(a => ({ id: a.id, name: a.name, email: a.email || '', status: a.status.toLowerCase(), planId: a.plan.toLowerCase() })));
      } catch (err) {
        console.error('failed to load recipients', err);
      } finally {
        setLoadingRecipients(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState<string>('');
  const [personalized, setPersonalized] = useState(false);

  const plans = useMemo(() => ['basic', 'standard', 'premium'], []);

  const filtered = useMemo(() => {
    return recipients.filter(r => {
      if (planFilter !== 'all' && r.planId !== planFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search && !(`${r.name} ${r.email}`.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [recipients, planFilter, statusFilter, search]);

  function toggleSelectAll(v: boolean) {
    const next: Record<string, boolean> = {};
    filtered.forEach(r => next[r.id] = v);
    setSelected(prev => ({ ...prev, ...next }));
  }

  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSend() {
    const to = Object.keys(selected).filter(k => selected[k] === true);
    if (to.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setIsSending(true);

    const notificationData = {
      recipientIds: to,
      subject: subject || 'Message',
      message: message,
      // scheduledAt: scheduleAt || null, // Scheduling can be added later
    };

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || `${to.length} notification(s) sent successfully!`);
        setSubject('');
        setMessage('');
        setSelected({});
      } else {
        throw new Error(result.error || 'Failed to send notifications.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Composer */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Compose Notification</h3>
                    <div className="text-sm text-gray-500">Write your message and choose recipients on the right</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setPreviewOpen(true)} disabled={(!subject && !message) || Object.values(selected).filter(Boolean).length === 0}>Preview</Button>
                    <Button className="bg-violet-600 text-white" onClick={handleSend} disabled={isSending || (!subject && !message) || Object.values(selected).filter(Boolean).length === 0}>{isSending ? 'Sending...' : 'Send'}</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-56 border border-gray-200 rounded-md p-3" placeholder="Write your message here"></textarea>
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Schedule for</label>
                    <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="text-sm border rounded px-2 py-1" />
                    <div className="text-xs text-gray-500">(Leave blank to send immediately)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipients */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 sticky top-20">
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Recipients</div>
                  <div className="text-sm text-gray-500">{filtered.length}</div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Select value={planFilter} onValueChange={(v) => setPlanFilter(v)}>
                    <SelectTrigger className="h-9 text-sm min-w-[10rem]"><SelectValue placeholder="All plans" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All plans</SelectItem>
                      {plans.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                    <SelectTrigger className="h-9 text-sm w-40"><SelectValue placeholder="All status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleSelectAll(true)}>Select all</Button>
                    <Button variant="outline" size="sm" onClick={() => toggleSelectAll(false)}>Clear</Button>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Selected: {Object.values(selected).filter(Boolean).length}</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-auto">
                  {loadingRecipients ? (
                    // show skeleton placeholders while recipients load
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden">
                            <Skeleton className="h-10 w-10 rounded-full" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-4 w-4 rounded" />
                        </div>
                      </div>
                    ))
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No recipients found</div>
                  ) : (
                    filtered.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-sm text-gray-500">{r.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-sm ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</div>
                          <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleSelect(r.id)} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {previewOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setPreviewOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto overflow-visible z-50">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Preview Notification</h3>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setPreviewOpen(false)}>Close</Button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Subject</div>
                    <div className="mb-2 font-medium text-lg">{subject || '(No subject)'}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">Message</div>
                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded shadow-sm">{message || '(No message)'}</div>
                  </div>

                  <div className="text-xs text-gray-500">Character count: {message.length}</div>

                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="form-checkbox" checked={personalized} onChange={(e) => setPersonalized(e.target.checked)} />
                      <span className="text-sm">Personalized preview (replace {'{{name}}'})</span>
                    </label>
                    <div className="mt-3">
                      <div className="text-sm text-gray-500">Example personalized message for first selected recipient:</div>
                      <div className="whitespace-pre-wrap bg-white p-3 border rounded mt-2">
                        {(() => {
                          const sel = Object.keys(selected).find(k => selected[k]);
                          const r = recipients.find(x => x.id === sel);
                          const name = r?.name || 'Recipient';
                          const base = (message || '(No message)');
                          return personalized ? base.replace(/\{\{\s*name\s*\}\}/gi, name) : base;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="text-sm text-gray-500 mb-2">Recipients</div>
                  <div className="text-sm mb-2 font-medium">{Object.keys(selected).filter(k => selected[k]).length} selected</div>
                  <div className="text-sm text-gray-500 mb-3">Showing up to 5 recipients</div>
                  <div className="space-y-2 max-h-64 overflow-auto border p-2 rounded">
                    {Object.keys(selected).filter(k => selected[k]).slice(0,5).map(id => {
                      const r = recipients.find(x => x.id === id);
                      if (!r) return null;
                      return (
                        <div key={id} className="p-2 border rounded flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">{(r.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-sm text-gray-500">Scheduled</div>
                  <div className="mb-4">{scheduleAt || 'Send now'}</div>

                  <div className="mt-4 flex flex-col gap-2"> 
                    <Button className="bg-violet-600 text-white" onClick={() => { handleSend(); setPreviewOpen(false); }} disabled={isSending}>
                      {isSending ? 'Sending...' : 'Send Now'}
                    </Button>
                    <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>, document.body)
        }
      </div>
    </div>
  );
}
