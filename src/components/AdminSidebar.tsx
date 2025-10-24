"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  Users,
  PlaySquare,
  Bell,
  LineChart,
  Settings,
  FileText,
  LogOut,
  ChevronDown,
  Inbox,
  Send,
} from 'lucide-react';

const NavItem = ({ icon: Icon, text, href = '#', active = false, className = '' }: { icon: any; text: string; href?: string; active?: boolean; className?: string }) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 text-white rounded-lg transition-colors duration-150 ${active ? 'bg-purple-700' : 'hover:bg-purple-700/50'} ${className}`}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span>{text}</span>
  </Link>
);

export default function AdminSidebar() {
  const pathname = usePathname() || '';

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const [notifOpen, setNotifOpen] = useState(() => isActive('/wp-admin/notifications'));
  const [exitOpen, setExitOpen] = useState(false);

  return (
    <aside className="w-64 bg-[#4A148C] text-white flex flex-col p-4 h-screen flex-shrink-0 sticky top-0 overflow-y-auto">
      <div className="flex items-center mb-8">
        <div className="bg-white text-purple-800 font-bold text-xl p-2 rounded-md mr-3">B</div>
        <h1 className="text-2xl font-bold">Billistry</h1>
      </div>

      <nav className="flex flex-col space-y-2">
        <NavItem icon={Home} text="Dashboard" href="/wp-admin/dashboard" active={isActive('/wp-admin/dashboard')} />
        <NavItem icon={Users} text="Manage Admin's" href="/wp-admin/manage-admins" active={isActive('/wp-admin/manage-admins')} />
        <NavItem icon={PlaySquare} text="Subscriptions" href="/wp-admin/subscriptions" active={isActive('/wp-admin/subscriptions')} />

        {/* Notifications collapsible group */}
        <div>
          {/** parent shows active if any notifications route is active */}
          <button
            onClick={() => setNotifOpen(v => !v)}
            className={`flex items-center justify-between w-full px-4 py-3 text-left ${isActive('/wp-admin/notifications') ? 'bg-purple-700 text-white' : 'text-purple-100 hover:bg-purple-700/50'} rounded-lg transition-colors duration-150`}
            aria-expanded={notifOpen}
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-3" />
              <span className="text-base font-medium">Notifications</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${notifOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>

          <div className={`flex flex-col mt-1 space-y-1 ${notifOpen ? 'block' : 'hidden'}`}>
            <NavItem icon={Inbox} text="Inbox" href="/wp-admin/notifications/show" active={isActive('/wp-admin/notifications/show')} className="pl-12" />
            <NavItem icon={Send} text="Compose" href="/wp-admin/notifications/send" active={isActive('/wp-admin/notifications/send')} className="pl-12" />
          </div>
  </div>
        <NavItem icon={Settings} text="Settings" href="/wp-admin/settings" active={isActive('/wp-admin/settings')} />
        <NavItem icon={FileText} text="Audit Logs" href="/wp-admin/audit-logs" active={isActive('/wp-admin/audit-logs')} />
        {/* Exit: open confirmation popup, no navigation/action */}
        <button
          type="button"
          onClick={() => setExitOpen(true)}
          className="flex items-center px-4 py-3 text-white rounded-lg transition-colors duration-150 hover:bg-purple-700/50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Exit</span>
        </button>
      </nav>
      {/* Confirmation modal (rendered via portal into document.body to avoid stacking context issues) */}
      {exitOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setExitOpen(false)}
            aria-hidden
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Exit"
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Exit</h3>
              <button
                aria-label="Close dialog"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setExitOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600">Are you sure you want to exit?</p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-100 rounded-md"
                  onClick={() => setExitOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 py-2 bg-red-600 text-white rounded-md"
                  onClick={() => setExitOpen(false)}
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
