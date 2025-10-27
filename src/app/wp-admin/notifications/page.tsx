"use client";

import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { getNotifications, NotificationItem } from './store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// imported from './sampleNotifications' above

type FilterType = 'all' | 'success' | 'warning' | 'info';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const all = getNotifications();
  const filtered = useMemo(() => {
    if (filter === 'all') return all;
    return all.filter((n: NotificationItem) => n.type === filter);
  }, [filter, all]);

  const unreadCount = all.filter((n: NotificationItem) => n.unread).length;

  return (
    <div className="flex flex-col min-h-0 h-full pt-0 pb-6">

      {/* Filter bar - styled like Manage Admins */}
      <div className="md:sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b -mx-6 lg:-mx-8">
        <div className="px-6 lg:px-8 py-2 rounded-b-lg shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
              All
            </button>
            <button onClick={() => setFilter('success')} className={`px-3 py-1 rounded-full text-sm ${filter === 'success' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
              Success
            </button>
            <button onClick={() => setFilter('warning')} className={`px-3 py-1 rounded-full text-sm ${filter === 'warning' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
              Warning
            </button>
            <button onClick={() => setFilter('info')} className={`px-3 py-1 rounded-full text-sm ${filter === 'info' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
              Info
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-white text-violet-600 border border-violet-300">Filter</Button>
          </div>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-auto pb-6 pt-0">
        <div className="space-y-4 px-0 pt-6">
          {filtered.map((n: NotificationItem) => (
            <NotificationCard key={n.id} n={n} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ n }: { n: any }) {
  const bgClass = n.type === 'success' ? 'bg-white' : n.type === 'warning' ? 'bg-orange-50' : 'bg-white';
  const titleColor = n.type === 'success' ? 'text-green-600' : n.type === 'warning' ? 'text-orange-600' : 'text-indigo-700';

  const Icon = n.type === 'success' ? CheckCircle2 : n.type === 'warning' ? AlertTriangle : Info;

  return (
    <Card className={`${bgClass} border border-gray-200 shadow-sm`}>
      <CardContent className="flex items-start gap-4">
        <div className="mt-1">
          <Icon className={`w-6 h-6 ${titleColor}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`font-semibold ${titleColor}`}>{n.title}</div>
              <div className="text-sm text-gray-600 mt-1">{n.message}</div>
            </div>
            <div className="text-sm text-gray-400">{n.time}</div>
          </div>

          <div className="mt-3">
            <button className="text-sm text-violet-500 hover:underline">Mark as Read</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
