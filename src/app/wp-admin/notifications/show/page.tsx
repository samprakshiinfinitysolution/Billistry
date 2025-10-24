"use client";

import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { getNotifications, markAsRead } from '../store';

type FilterType = 'all' | 'success' | 'warning' | 'info';

export default function NotificationsShowPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const all = getNotifications();
  const filtered = useMemo(() => {
    let base = filter === 'all' ? all.slice() : all.filter(n => n.type === filter);
    if (unreadOnly) base = base.filter(n => n.unread);
    // keep original ordering (time) for now
    return base;
  }, [filter, unreadOnly, all]);

  const unreadCount = all.filter(n => n.unread).length;

  return (
    <div className="flex flex-col min-h-0 h-full pt-0 pb-6">
      {/* Header removed (layout shows title) */}

      {/* Subheader / filter - aligned with layout padding */}
      <div className="md:sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b -mx-6 lg:-mx-8">
        <div className="px-6 lg:px-8 py-2 rounded-b-lg shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">{filtered.length} notifications</div>
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
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">{unreadCount} new</div>
            <button type="button" onClick={() => setUnreadOnly(u => !u)} className={`px-3 py-1 rounded-md text-sm ${unreadOnly ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
              {unreadOnly ? 'Unread only' : 'Show unread'}
            </button>
          </div>
        </div>
      </div>

      {/* Cards area: scrollable, cards stretch */}
      <div className="flex-1 overflow-auto pb-6 pt-6">
        <div className="grid grid-cols-1 gap-4 auto-rows-fr items-stretch h-full px-0">
          {filtered.map(n => (
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
    <Card className={`${bgClass} border border-gray-200 shadow-sm rounded-2xl h-full flex flex-col py-0`}>
      <CardContent className="flex-1 flex flex-col justify-between px-4 pt-6 pb-4">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <Icon className={`w-6 h-6 ${titleColor}`} />
              </div>
              <div>
                <div className={`font-semibold ${titleColor}`}>{n.title}</div>
                <div className="text-sm text-gray-600 mt-1">{n.message}</div>
              </div>
            </div>

            <div className="text-sm text-gray-400">{n.time}</div>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-100 flex items-center justify-between text-sm py-2">
          <div className="text-sm text-gray-600">{n.unread ? <span className="px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-700">Unread</span> : <span className="text-gray-500">Read</span>}</div>
          <button className="text-sm text-violet-500 hover:underline">Mark as Read</button>
        </div>
      </CardContent>
    </Card>
  );
}
