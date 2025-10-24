import BillistrySidebar  from '@/components/BillistrySidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      < BillistrySidebar />
      <main className="flex-1 overflow-y-auto  bg-gray-50">
        {children}
      </main>
    </div>
  );
}
