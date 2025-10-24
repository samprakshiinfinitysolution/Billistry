"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { addNotification } from '@/app/wp-admin/notifications/store';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { getAdmins, refreshAdmins } from '@/app/wp-admin/manage-admins/data';

type Recipient = {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  status: string;
  planId: string;
};

export default function NotificationsSendPage() {
  // build recipients from admins store
  const mapAdminsToRecipients = (adminsList: any[]) =>
    // Only include admins that have both a non-empty name and email.
    adminsList
      .filter((a: any) => {
        const name = (a?.name || '').toString().trim();
        const email = (a?.email || '').toString().trim();
        return name.length > 0 && email.length > 0;
      })
      .map(a => {
        const rawName = (a?.name || '').toString().trim();
        const email = (a?.email || '').toString().trim();
        let displayName = rawName;
        // If name equals email or is empty, derive a friendly name from the email local-part
        if (!displayName || displayName === email) {
          displayName = (email.split('@')[0] || email).replace(/[._\-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        }
        return {
          id: a.id,
          name: rawName,
          displayName,
          email: email || '',
          status: (a.status || '').toLowerCase(),
          planId: (a.plan || '').toLowerCase(),
        } as Recipient;
      });

  const [recipients, setRecipients] = useState<Recipient[]>(() => mapAdminsToRecipients(getAdmins()));

  // Keep recipients in sync with the central admins store. Refresh on mount and when other parts
  // of the app update admins (e.g. visiting subscriptions/manage-admins page triggers refreshAdmins()).
  useEffect(() => {
    let mounted = true;

    // update from current in-memory store immediately
    setRecipients(mapAdminsToRecipients(getAdmins()));

    // attempt to refresh from server once (best-effort)
    (async () => {
      try {
        await refreshAdmins();
        if (!mounted) return;
        setRecipients(mapAdminsToRecipients(getAdmins()));
      } catch (e) {
        // ignore errors — we'll still honor existing in-memory admins
      }
    })();

    const onUpdate = () => setRecipients(mapAdminsToRecipients(getAdmins()));
    window.addEventListener('adminsUpdated', onUpdate);
    return () => { mounted = false; window.removeEventListener('adminsUpdated', onUpdate); };
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

  function handleSend() {
    const toIds = Object.keys(selected).filter(k => selected[k]);
    if (toIds.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    const recipientsToSend = toIds.map(id => recipients.find(r => r.id === id)).filter(Boolean) as Recipient[];

    // Prepare payload
    const payload = {
      recipients: recipientsToSend.map(r => r.email),
      subject: subject || 'Message from Billistry',
      message,
      scheduleAt: scheduleAt || null,
    };

    toast.loading('Sending emails...');

    fetch('/api/admin/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    }).then(async res => {
      const json = await res.json().catch(() => ({ success: false, error: 'Invalid JSON from server' }));
      toast.dismiss();
      if (!res.ok) {
        // fallback to local notification + error
        recipientsToSend.forEach(r => addNotification({ type: 'info', title: subject || 'Message', message: `To: ${r.email}\n\n${message}` }));
        toast.error(json?.error || 'Failed to send emails, notifications queued locally');
        return;
      }
      // success
      setSubject('');
      setMessage('');
      setSelected({});
      toast.success(json?.message || `${recipientsToSend.length} email(s) sent`);
    }).catch(err => {
      toast.dismiss();
      // fallback: queue local notifications
      recipientsToSend.forEach(r => addNotification({ type: 'info', title: subject || 'Message', message: `To: ${r.email}\n\n${message}` }));
      toast.error('Network error while sending emails, notifications queued locally');
      console.error('send email failed', err);
    });
  }

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="space-y-4">
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Composer */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Compose Notification</h3>
                    <div className="text-sm text-gray-500">Write your message and choose recipients on the right</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="border border-gray-200 hover:bg-gray-50" onClick={() => setPreviewOpen(true)}>Preview</Button>
                    <Button className="border border-violet-600 bg-violet-600 text-white hover:bg-violet-700" onClick={handleSend}>Send</Button>
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
          <div className="lg:col-span-2 min-w-[18rem]">
            <Card className="border border-gray-200 sticky top-20 shadow-sm">
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
                  <div className="text-sm">
                    <button className="text-sm text-violet-600 border rounded px-2 py-1 hover:bg-violet-50" onClick={() => toggleSelectAll(true)}>Select all</button>
                    <button className="ml-2 text-sm text-gray-500 border rounded px-2 py-1 hover:bg-gray-50" onClick={() => toggleSelectAll(false)}>Clear</button>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Selected: {Object.values(selected).filter(Boolean).length}</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-auto">
                  {filtered.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm hover:bg-gray-50 transition">
                      <div>
                        <div className="font-medium">{r.displayName || r.name}</div>
                        <div className="text-sm text-gray-500">{r.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</div>
                        <input type="checkbox" className="form-checkbox h-4 w-4" checked={!!selected[r.id]} onChange={() => toggleSelect(r.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {previewOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setPreviewOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-auto overflow-hidden z-50 ring-1 ring-gray-100">
              <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
                <div>
                  <h3 className="text-lg font-semibold">Preview Notification</h3>
                  <div className="text-xs text-gray-500">Quick preview before sending — confirm recipients and content</div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-sm text-gray-500 border rounded px-2 py-1 hover:bg-gray-50" onClick={() => setPreviewOpen(false)}>Close</button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50">
                <div className="md:col-span-2 bg-white p-4 rounded shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Subject</div>
                  <div className="mb-4 font-medium text-gray-800">{subject || '(No subject)'}</div>

                  <div className="text-sm text-gray-500 mb-2">Message</div>
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded mb-3 border">{message || '(No message)'}</div>

                  <div className="text-xs text-gray-500 mb-3">Character count: {message.length}</div>

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
                          const name = r?.displayName || r?.name || 'Recipient';
                          const base = (message || '(No message)');
                          return personalized ? base.replace(/\{\{\s*name\s*\}\}/gi, name) : base;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Recipients</div>
                        <div className="text-sm font-medium">{Object.keys(selected).filter(k => selected[k]).length} selected</div>
                      </div>
                      <div className="text-xs text-gray-400">Showing up to 5</div>
                    </div>

                    <div className="space-y-2 mt-3 max-h-64 overflow-auto">
                      {Object.keys(selected).filter(k => selected[k]).slice(0,5).map(id => {
                        const r = recipients.find(x => x.id === id);
                        if (!r) return null;
                        return (
                          <div key={id} className="p-2 border rounded flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{r.displayName || r.name}</div>
                              <div className="text-xs text-gray-500">{r.email}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 text-sm text-gray-500">Scheduled</div>
                    <div className="mb-4">{scheduleAt || 'Send now'}</div>

                    <div className="mt-4 flex flex-col gap-2">
                      <Button className="border border-violet-600 bg-violet-600 text-white hover:bg-violet-700" onClick={() => { handleSend(); setPreviewOpen(false); }}>Send now</Button>
                      <Button className="border text-gray-700 hover:bg-gray-100" variant="ghost" onClick={() => setPreviewOpen(false)}>Close</Button>
                    </div>
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
