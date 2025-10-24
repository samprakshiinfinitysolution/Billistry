

'use client';

import Sidebar from '@/components/Sidebar';
import useAuthGuard from '@/hooks/useAuthGuard';
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from '@/components/ui/spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuthGuard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <Spinner /> */}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden ">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
        <Toaster richColors position="top-right" />
      </main>
    </div>
  );
}