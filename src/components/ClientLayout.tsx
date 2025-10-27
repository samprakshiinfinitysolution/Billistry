'use client';

import { usePathname } from 'next/navigation';
import TopHeader from '@/components/TopHeader';
import Footer from '@/components/Footer';
import BillistrySidebar from '@/components/BillistrySidebar';
import { Provider } from "react-redux";
import { Toaster } from 'react-hot-toast';
import { store } from "@/redux/store";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith('/dashboard');
  const isCompany = pathname.startsWith('/billistry-company');

  return (
    <Provider store={store}>
      <Toaster position="top-center" reverseOrder={false} />
      {/* Dashboard layout */}
      {isDashboard && (
        <div className="flex w-full h-screen  overflow-hidden">
          {/* Sidebar placeholder */}
          {/* <Sidebar /> */}
          <main className="flex-1 h-full overflow-auto ">
            {children}
          </main>
        </div>
      )}

      {/* Company admin layout */}
      {isCompany && (
        <div className="flex w-full h-screen  overflow-hidden">
          {/* Billistry company sidebar */}
          {/* <BillistrySidebar /> */}
          <main className="flex-1 h-full overflow-auto ">
            {children}
          </main>
        </div>
      )}

      {/* Public layout */}
      {!isDashboard && !isCompany && (
        <div className="flex flex-col min-h-screen w-full ">
          <TopHeader />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </div>
      )}
    </Provider>
  );
}
