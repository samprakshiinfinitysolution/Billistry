"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const kpis = [
  { title: 'Total Events', value: '1,247' },
  { title: 'Total Events', value: '1,247' },
  { title: 'Total Events', value: '1,247' },
];

const logs = [
  {
    id: '1',
    title: 'User Login',
    actor: 'Durgesh Rajak',
    email: 'durgesh@billistry.com',
    time: '2025-10-11 14:30:25',
    ip: '192.168.1.100',
    details: 'Successful login from Chrome on Windows',
    status: 'success',
  },
  {
    id: '2',
    title: 'Failed Login Attempt',
    actor: 'Unknown',
    email: 'test@example.com',
    time: '2025-10-11 08:15:55',
    ip: '203.0.113.42',
    details: 'Invalid credentials - 3rd attempt',
    status: 'failed',
  },
  {
    id: '3',
    title: 'Data Export',
    actor: 'Durgesh Rajak',
    email: 'durgesh@billistry.com',
    time: '2025-10-10 16:40:22',
    ip: '203.0.113.42',
    details: 'Exported subscription data (CSV)',
    status: 'success',
  },
];

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
            <h4 className="text-md font-semibold text-gray-800">{log.title}</h4>
            <div className="text-sm text-gray-600">{log.actor}</div>
            <div className="text-sm text-gray-500 mt-2">{log.email}</div>
            <div className="text-xs text-gray-400 mt-1">Time: {log.time} • IP: {log.ip}</div>
            <div className="text-sm text-gray-600 mt-2">Details: {log.details}</div>
          </div>
          <div className="ml-4">
            {log.status === 'success' ? (
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      return (
        l.title.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.ip.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <KPI key={k.title + k.value} k={k} />
          ))}
        </div>

        <div>
          <Input placeholder="Search Admin's" className="w-full" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="space-y-4">
          {filtered.map((l) => (
            <LogItem key={l.id} log={l} />
          ))}
        </div>
      </div>
    </div>
  );
}
