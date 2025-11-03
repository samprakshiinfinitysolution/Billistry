"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import TableSkeleton from '@/components/ui/TableSkeleton';

function KPI({ k }: { k: any }) {
  return (
    <Card className="border border-gray-200">
      <CardContent>
        <div className="text-sm text-gray-500">{k.title}</div>
        <div className="mt-2 text-xl font-semibold text-gray-900">{k.value}</div>
      </CardContent>
    </Card>
  );
}

function LogItem({ log }: { log: any }) {
  return (
    <Card className="border border-gray-200">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-md font-semibold text-gray-800">{log.action || log.title || log.event || 'Event'}</h4>
            <div className="text-sm text-gray-600">{log.actorName || log.actor || (log.user && (log.user.name || log.user.email)) || '—'}</div>
            <div className="text-sm text-gray-500 mt-2">{(log.user && log.user.email) || log.email || ''}</div>
            <div className="text-xs text-gray-400 mt-1">Time: {log.createdAt ? new Date(log.createdAt).toLocaleString() : (log.time || '—')} • IP: {log.ip || '—'}</div>
            <div className="text-sm text-gray-600 mt-2">Details: {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || log.before || log.after || '{}')}</div>
          </div>
          <div className="ml-4">
            {String((log.status || log.result || 'success')).toLowerCase() === 'success' ? (
              <Badge className="bg-green-100 text-green-700">Success</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700">Failed</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuditLogsPage() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<{ total?: number } | null>(null);
  const [limit, setLimit] = useState<number>(100);
  const [businessId, setBusinessId] = useState<string | undefined>(undefined);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [rawDebug, setRawDebug] = useState<any>(null);

  // Filters
  const [dateRange, setDateRange] = useState<any | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [skip, setSkip] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
  const url = new URL(window.location.origin + '/api/admin/audit-logs');
        url.searchParams.set('limit', String(Math.max(1, Math.min(500, limit))));
  if (showAll) url.searchParams.set('public', '1');
        if (businessId) url.searchParams.set('businessId', businessId);
        if (debugMode) url.searchParams.set('debug', '1');
        const res = await fetch(url.toString(), { credentials: 'include' });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to fetch audit logs');
        }
        const json = await res.json();
        if (!mounted) return;
        const items = json?.items || [];
        setLogs(items);
        if (json?.count != null) setTotals({ total: json.count });
        // keep raw debug payload for inspection when debugMode is enabled
        if (debugMode) setRawDebug(json);
      } catch (err: any) {
        console.error('audit logs fetch failed', err);
        if (!mounted) return;
        setError(err?.message || String(err));
        setLogs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [limit, businessId, debugMode, showAll]);

  // derive unique filter options
  const modules = useMemo(() => Array.from(new Set(logs.map((l) => l.resourceType || '').filter(Boolean))), [logs]);
  const actions = useMemo(() => Array.from(new Set(logs.map((l) => (l.action || '').toString()).filter(Boolean))), [logs]);
  const users = useMemo(() => Array.from(new Set(logs.map((l) => (l.user && (l.user.name || l.user.email)) || l.actorName || l.email || '').filter(Boolean))), [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      // date range filter
      try {
        if (startDate) {
          const d = new Date(l.createdAt || l.time || null);
          const s = new Date(startDate);
          if (isNaN(d.getTime()) || d < s) return false;
        }
        if (endDate) {
          const d = new Date(l.createdAt || l.time || null);
          const e = new Date(endDate);
          // include entire day for endDate
          e.setHours(23, 59, 59, 999);
          if (isNaN(d.getTime()) || d > e) return false;
        }
      } catch (e) {}

      if (moduleFilter && moduleFilter !== '') {
        if ((l.resourceType || '') !== moduleFilter) return false;
      }
      if (actionFilter && actionFilter !== '') {
        if ((l.action || '') !== actionFilter) return false;
      }
      if (userFilter && userFilter !== '') {
        const uname = (l.user && (l.user.name || l.user.email)) || l.actorName || l.email || '';
        if (!uname.toLowerCase().includes(userFilter.toLowerCase())) return false;
      }

      if (!q) return true;
      const hay = [l.action, l.title, l.event, l.actorName, l.email, l.ip, l.resourceType, JSON.stringify(l.details || l.before || l.after || '')].join(' ');
      return hay.toLowerCase().includes(q);
    });
  }, [query, logs, startDate, endDate, moduleFilter, actionFilter, userFilter]);

  const kpis = [
    { title: 'Total Events', value: totals?.total?.toString?.() || logs.length.toString() },
    { title: 'Loaded', value: String(logs.length) },
    { title: 'Errors', value: error ? '1' : '0' },
  ];

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <KPI key={k.title + k.value} k={k} />
          ))}
        </div>

        <div>
          <div className="flex gap-2">
            <Input placeholder="Search Admin's" className="flex-1" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Input placeholder="BusinessId (optional)" className="w-64" value={businessId || ''} onChange={(e) => setBusinessId(e.target.value || undefined)} disabled={showAll} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showAll} onChange={(e) => { setShowAll(e.target.checked); if (e.target.checked) setBusinessId(undefined); }} />
              <span>Show all activities</span>
            </label>
            <Input placeholder="Limit" className="w-28" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value || '100'))} />
            <button
              onClick={() => { setDebugMode((d) => !d); setRawDebug(null); }}
              className={`px-3 py-1 rounded border ${debugMode ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
              {debugMode ? 'Debug: ON' : 'Debug: OFF'}
            </button>
            <button
              onClick={() => { setLoading(true); setError(null); setRawDebug(null); /* force reload by re-running effect */
                // simple reload: re-run fetch by toggling a small state change
                // we'll call load directly for immediate effect
                (async () => {
                  try {
                    const url = new URL(window.location.origin + '/api/admin/audit-logs');
                    url.searchParams.set('limit', String(Math.max(1, Math.min(500, limit))));
                    if (showAll) url.searchParams.set('public', '1');
                    if (businessId) url.searchParams.set('businessId', businessId);
                    if (debugMode) url.searchParams.set('debug', '1');
                    const res = await fetch(url.toString(), { credentials: 'include' });
                    if (!res.ok) { const text = await res.text(); throw new Error(text || 'Failed to fetch'); }
                    const json = await res.json();
                    setLogs(json?.items || []);
                    if (json?.count != null) setTotals({ total: json.count });
                    if (debugMode) setRawDebug(json);
                  } catch (e: any) { console.error(e); setError(e?.message || String(e)); setLogs([]); }
                  setLoading(false);
                })();
              }}
              className="px-3 py-1 rounded border bg-white border-gray-200"
            >Reload</button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Filters row */}
          <div className="flex flex-col lg:flex-row gap-3 items-start">
              <div className="flex gap-2 items-center flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-56">
                      {dateRange?.from ? dateRange.from.toLocaleDateString() : 'From'}
                      {dateRange?.to ? ` — ${dateRange.to.toLocaleDateString()}` : ''}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="p-4">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(r: any) => {
                          setDateRange(r as any);
                          // update fallback string filters for compatibility
                          setStartDate(r?.from ? new Date(r.from).toISOString().slice(0, 10) : '');
                          setEndDate(r?.to ? new Date(r.to).toISOString().slice(0, 10) : '');
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
              </div>

            <div className="flex gap-2 items-center ml-auto">
              <Select onValueChange={(v) => setModuleFilter(v === '__all__' ? '' : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Modules</SelectItem>
                  {modules.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(v) => setActionFilter(v === '__all__' ? '' : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Actions</SelectItem>
                  {actions.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(v) => setUserFilter(v === '__all__' ? '' : v)}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input placeholder="Limit" className="w-24" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value || '100'))} />
              <button onClick={() => { setSkip(0); setLoading(true); setError(null); setRawDebug(null); /* reload */ (async () => { try { const url = new URL(window.location.origin + '/api/admin/audit-logs'); url.searchParams.set('limit', String(Math.max(1, Math.min(500, limit)))); if (showAll) url.searchParams.set('public', '1'); if (businessId) url.searchParams.set('businessId', businessId); if (debugMode) url.searchParams.set('debug', '1'); const res = await fetch(url.toString(), { credentials: 'include' }); if (!res.ok) { const text = await res.text(); throw new Error(text || 'Failed to fetch'); } const json = await res.json(); setLogs(json?.items || []); if (json?.count != null) setTotals({ total: json.count }); if (debugMode) setRawDebug(json); } catch (e: any) { console.error(e); setError(e?.message || String(e)); setLogs([]); } setLoading(false); })(); }} className="px-3 py-1 rounded border bg-white border-gray-200">Reload</button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                  <TableSkeleton rows={2} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">Error loading audit logs: {error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No audit logs found.</div>
          ) : (
            <Card className="rounded-lg border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-500">User</TableHead>
                      <TableHead className="text-gray-500">Module</TableHead>
                      <TableHead className="text-gray-500">Action</TableHead>
                      <TableHead className="text-gray-500">Description</TableHead>
                      <TableHead className="text-gray-500">IP Address</TableHead>
                      <TableHead className="text-gray-500">Date / Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((log: any, idx: number) => (
                      <TableRow key={log._id || idx}>
                        <TableCell>
                          <div className="font-medium">{(log.user && (log.user.name || log.user.email)) || log.actorName || log.email || '—'}</div>
                          {log.business?.name && (
                            <div className="text-xs text-gray-500">{log.business.name}</div>
                          )}
                        </TableCell>
                        <TableCell>{log.resourceType || log.module || '—'}</TableCell>
                        <TableCell>{log.action || log.event || '—'}</TableCell>
                        <TableCell className="max-w-xl truncate">{(log.after && JSON.stringify(log.after)) || (log.before && JSON.stringify(log.before)) || log.details || ''}</TableCell>
                        <TableCell>{log.ip || '—'}</TableCell>
                        <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : (log.time ? new Date(log.time).toLocaleString() : '—')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
        {debugMode && rawDebug && (
          <div className="mt-4 p-3 bg-gray-50 border rounded text-xs overflow-auto">
            <div className="font-semibold text-sm mb-2">Server debug payload</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(rawDebug, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
