"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, Inbox, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { fetchNotifications, markAsRead, markAllAsRead, NotificationItem, subscribe } from '../store';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'success' | 'warning' | 'info';

export default function NotificationsShowPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Fetch initial notifications from the API
    fetchNotifications().finally(() => setIsLoading(false));

    // Subscribe to the notification store for updates
    const unsubscribe = subscribe(setNotifications);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast('Marked as read');
    } catch {
      toast.error('Could not mark as read. Please try again.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark all as read. Please try again.');
    }
  };

  const filtered = useMemo(() => {
    let base = notifications;
    if (filter !== 'all') base = base.filter(n => n.type === filter);
    if (unreadOnly) base = base.filter(n => n.unread);
    return base;
  }, [filter, unreadOnly, notifications]);

  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

  return (
    <div className="flex flex-col min-h-0 h-full pt-0 pb-6">
      <div className="md:sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b -mx-6 lg:-mx-8">
        <div className="px-6 lg:px-8 py-2 rounded-b-lg shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
            <div className="text-sm text-gray-500 pl-2 border-l">{filtered.length} notifications</div>
          </div>

          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                Mark all as read
              </Button>
            )}
            <button type="button" onClick={() => setUnreadOnly(u => !u)} className={`px-3 py-1 rounded-md text-sm ${unreadOnly ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
              {unreadOnly ? 'Unread Only' : `Show ${unreadCount} Unread`}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-6 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <LoaderCircle className="w-16 h-16 mb-4 text-gray-300 animate-spin" />
            <h3 className="text-xl font-semibold">Loading Notifications...</h3>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 auto-rows-fr items-stretch h-full px-0">
            {filtered.map(n => (
              <NotificationCard key={n.id} n={n} onMarkAsRead={handleMarkAsRead} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Inbox className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold">All caught up!</h3>
            <p>You have no notifications here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ n, onMarkAsRead }: { n: NotificationItem; onMarkAsRead: (id: string) => void; }) {
  const bgClass = n.unread ? (n.type === 'warning' ? 'bg-orange-50' : 'bg-white') : 'bg-gray-50';
  const titleColor = n.type === 'success' ? 'text-green-600' : n.type === 'warning' ? 'text-orange-600' : 'text-indigo-700';

  const Icon = n.type === 'success' ? CheckCircle2 : n.type === 'warning' ? AlertTriangle : Info;

  return (
    <Card className={`${bgClass} border border-gray-200 shadow-sm rounded-2xl h-full flex flex-col`}>
      <CardContent className="flex-1 flex flex-col justify-between p-4">
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

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <div className="text-sm text-gray-600">
            {n.unread ? <span className="px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-700 font-medium">Unread</span> : <span className="text-gray-400">Read</span>}
          </div>
          {n.unread && (
            <button onClick={() => onMarkAsRead(n.id)} className="text-sm text-violet-500 hover:underline">Mark as Read</button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
