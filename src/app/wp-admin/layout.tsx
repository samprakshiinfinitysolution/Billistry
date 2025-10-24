"use client";

import AdminSidebar from '@/components/AdminSidebar';
import { usePathname, useRouter } from 'next/navigation';
import { Settings2, Bell, ChevronDown, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { getNotifications, getUnreadCount, subscribe, markAsRead, NotificationItem } from './notifications/store';
import { getAdmin } from './manage-admins/data';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  let headerTitle = 'Admin Dashboard';
  let headerSubtitle = '';
  if (pathname.startsWith('/wp-admin/manage-admins')) headerTitle = "Manage Admin's";
  if (pathname.startsWith('/wp-admin/manage-admins/add')) headerTitle = 'Add Admin';
  // edit route: /wp-admin/manage-admins/:id/edit
  const editMatch = pathname.match(/^\/wp-admin\/manage-admins\/([^/]+)\/edit/);
  if (editMatch) {
    headerTitle = 'Edit Admin';
    const admin = getAdmin(editMatch[1]);
    headerSubtitle = admin ? admin.name : '';
  }
  const detailsMatch = pathname.match(/^\/wp-admin\/manage-admins\/([^/]+)\/details/);
  if (detailsMatch) {
    headerTitle = 'Admin Details';
    const admin = getAdmin(detailsMatch[1]);
    headerSubtitle = admin ? admin.name : '';
  }
  if (pathname.startsWith('/wp-admin/subscriptions')) {
    headerTitle = 'Subscription Plans';
    headerSubtitle = '';
  }
  if (pathname.startsWith('/wp-admin/notifications')) {
    // default notifications section
    headerTitle = 'Notifications';
    headerSubtitle = '';
  }
  if (pathname.startsWith('/wp-admin/notifications/send')) {
    headerTitle = 'Send Notification';
    headerSubtitle = '';
  }
  if (pathname.startsWith('/wp-admin/notifications/show')) {
    headerTitle = 'Inbox';
    headerSubtitle = '';
  }
  
  if (pathname.startsWith('/wp-admin/audit-logs')) {
    headerTitle = 'Audit Logs';
    headerSubtitle = '';
  }
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [exitOpen, setExitOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLButtonElement | null>(null);
  const notifContentRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const onOpen = () => setExitOpen(true);
    window.addEventListener('openExitModal', onOpen as EventListener);
    return () => window.removeEventListener('openExitModal', onOpen as EventListener);
  }, []);

  // close dropdown if click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!dropdownRef.current) return;
      const target = e.target as Node;
      // if click is inside the trigger, keep open
      if (dropdownRef.current.contains(target)) return;
      // if click is inside the portal dropdown content, keep open
      if (dropdownContentRef.current && dropdownContentRef.current.contains(target)) return;
      // otherwise close
      setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
    return;
  }, [dropdownOpen]);

  // close notifications dropdown if click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && notifRef.current.contains(target)) return;
      if (notifContentRef.current && notifContentRef.current.contains(target)) return;
      setNotifOpen(false);
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
    return;
  }, [notifOpen]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications());

  useEffect(() => {
    const unsub = subscribe((items) => setNotifications(items));
    return unsub;
  }, []);
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <AdminSidebar />

      <main className="flex-1 h-screen overflow-auto px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          {/* Right-pane sticky header: placed inside main so it won't overlap the sidebar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b -mx-6 lg:-mx-8">
            <div className="h-16 flex items-center justify-between px-6 lg:px-8">
              <div>
                {/* show back button when on add-admin or edit-admin subroute */}
                {(pathname.startsWith('/wp-admin/manage-admins/add') || editMatch) ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/wp-admin/manage-admins')} className="-ml-1 p-2 rounded-md hover:bg-gray-100">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                      <h2 className="text-lg font-semibold">{headerTitle}</h2>
                      {headerSubtitle && <p className="text-sm text-gray-500 mt-0.5">{headerSubtitle}</p>}
                    </div>
                  </div>
                ) : (
                  <h2 className="text-lg font-semibold">{headerTitle}</h2>
                )}
                
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/wp-admin/settings')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push('/wp-admin/settings'); }}
                  aria-label="Open settings"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <Settings2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  ref={notifRef}
                  onClick={() => setNotifOpen(s => !s)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setNotifOpen(s => !s); }}
                  aria-label="Open notifications"
                  aria-expanded={notifOpen}
                  className="relative inline-flex items-center justify-center w-9 h-9 rounded-md bg-white border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <Bell className="w-4 h-4" />
                  {/* unread badge */}
                  {getUnreadCount() > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full ring-1 ring-white">{getUnreadCount()}</span>
                  )}
                </button>

                {/* Improved avatar + dropdown: compact horizontal trigger */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen((s) => !s)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setDropdownOpen(false);
                      if (e.key === 'Enter' || e.key === ' ') setDropdownOpen((s) => !s);
                    }}
                    className="inline-flex items-center gap-3 cursor-pointer select-none rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <Avatar>
                      <AvatarFallback className="w-8 h-8 text-sm font-medium">A</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-700">Admin</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </div>
                  </div>
                </div>
                {dropdownOpen && dropdownRef.current && typeof document !== 'undefined' && createPortal(
                  (() => {
                    const rect = dropdownRef.current!.getBoundingClientRect();
                    // position dropdown below the trigger; align right edge
                    const top = rect.bottom + window.scrollY + 8; // 8px gap
                    const left = rect.right + window.scrollX - 176; // dropdown width (w-44 = 176px)
                    return (
                      <div ref={dropdownContentRef} data-portal-dropdown style={{ position: 'absolute', top, left }} className="z-[99999]">
                        {/* caret */}
                        <div className="absolute -top-2 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200" />
                        <div className="w-44 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
                          {/* Profile removed: no profile route available in admin area */}
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
                            onClick={() => { setDropdownOpen(false); router.push('/wp-admin/settings'); }}
                          >
                            Settings
                          </button>
                          <div className="border-t" />
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
                            onClick={() => { setDropdownOpen(false); setExitOpen(true); }}
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    );
                  })(),
                  document.body
                )}
                {notifOpen && notifRef.current && typeof document !== 'undefined' && createPortal(
                  (() => {
                    const rect = notifRef.current!.getBoundingClientRect();
                    const top = rect.bottom + window.scrollY + 8;
                    const left = rect.right + window.scrollX - 320; // align right edge, dropdown width ~320
                    return (
                      <div ref={notifContentRef} data-portal-dropdown style={{ position: 'absolute', top, left }} className="z-[99999]">
                        <div className="w-80 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
                          <div className="px-4 py-2 border-b flex items-center justify-between">
                            <div className="font-medium">Notifications</div>
                            <div className="text-sm text-gray-500">{notifications.filter(n => n.unread).length} new</div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {notifications.slice(0,6).map((n: NotificationItem) => (
                              <button key={n.id} onClick={() => { setNotifOpen(false); router.push('/wp-admin/notifications/show'); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3">
                                <div className="mt-0.5">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${n.unread ? 'bg-red-500' : 'bg-gray-300'}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-sm text-gray-800">{n.title}</div>
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</div>
                                </div>
                                <div className="text-xs text-gray-400 ml-2">{n.time}</div>
                              </button>
                            ))}
                          </div>
                          <div className="border-t px-3 py-2 flex items-center justify-between">
                            <button onClick={() => { setNotifOpen(false); router.push('/wp-admin/notifications/show'); }} className="text-sm text-violet-600 hover:underline">View all</button>
                            <button onClick={() => setNotifOpen(false)} className="text-sm text-gray-500 hover:underline">Close</button>
                          </div>
                        </div>
                      </div>
                    );
                  })(),
                  document.body
                )}
              </div>
            </div>
          </div>

          {/* Exit confirmation modal (portal) */}
          {exitOpen && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setExitOpen(false)} />

              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Confirm Exit</h3>
                  <button aria-label="Close dialog" className="text-gray-500 hover:text-gray-700" onClick={() => setExitOpen(false)}>✕</button>
                </div>

                <div className="p-6 flex flex-col items-center text-center">
                  <Avatar>
                    <AvatarFallback className="w-12 h-12 text-lg font-medium">A</AvatarFallback>
                  </Avatar>
                  <div className="mt-3 text-lg font-semibold">Admin</div>
                  <p className="mt-4 text-sm text-gray-600">Are you sure you want to exit?</p>

                  <div className="mt-6 flex gap-3">
                    <button className="px-3 py-2 bg-gray-100 rounded-md" onClick={() => setExitOpen(false)}>Cancel</button>
                    <button className="px-3 py-2 bg-red-600 text-white rounded-md" onClick={() => setExitOpen(false)}>Yes, Exit</button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}

          <div className="pt-0 pb-0">{children}</div>
        </div>
      </main>
    </div>
  );
}

// Add event listener hook after component definition is not necessary; the component uses useEffect
