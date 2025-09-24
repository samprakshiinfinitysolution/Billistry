// 'use client';

// import Sidebar from '@/components/Sidebar';
// import useAuthGuard from '@/hooks/useAuthGuard';

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   useAuthGuard(); // Protect the dashboard

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar />
//       <main className="flex-1 overflow-y-auto bg-gray-50">
//         {children}
//       </main>
//     </div>
//   );
// }



'use client';

import Sidebar from '@/components/Sidebar';
import useAuthGuard from '@/hooks/useAuthGuard';
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
      </main>
    </div>
  );
}
