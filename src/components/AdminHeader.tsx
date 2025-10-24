"use client";

import { Settings2, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white/95 backdrop-blur-sm z-40 shadow-sm border-b fixed top-0 left-0 right-0 md:left-64">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <Settings2 className="text-gray-600" />
        <Bell className="text-gray-600" />
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarFallback className="w-8 h-8 text-sm font-medium">D</AvatarFallback>
          </Avatar>
          <span>Durgesh</span>
        </div>
      </div>
    </header>
  );
}
