'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import TopHeader from '@/components/TopHeader';
import Footer from '@/components/Footer';
import { Provider } from "react-redux";
import { Toaster } from 'react-hot-toast';
import { store } from "@/redux/store";
import AdvertisementPopup from './AdvertisementPopup';
import AnnouncementBar from './AnnouncementBar';


interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [announcementHeight, setAnnouncementHeight] = useState(0);

  // usePathname() can sometimes be empty during hydration; fall back to window.location.pathname when available
  let pathname = usePathname();
  if ((!pathname || pathname === '/') && typeof window !== 'undefined') {
    pathname = window.location.pathname;
  }

  const isDashboard = pathname.startsWith('/dashboard');
  
  const isWpAdmin = pathname.startsWith('/wp-admin');
  

  return (
    <Provider store={store}>
      <SessionProvider>
        <Toaster position="top-center" reverseOrder={false} />
        {/* Printable pages and wp-admin: minimal wrapper without header/footer/sidebar */}
        { isWpAdmin ? (
          <main className="w-full">
            {children}
          </main>
        ) : isDashboard  ? (
          <div className="flex w-full h-screen  overflow-hidden">
            <main className="flex-1 h-full overflow-auto ">
              {children}
            </main>
          </div>
        ) : (
          <div className="flex flex-col min-h-screen w-full ">
           
            <AnnouncementBar setHeight={setAnnouncementHeight} />
            <TopHeader announcementHeight={announcementHeight} />
            
            <main className="flex-1 w-full">
             
             
             
              {children}
            </main>
            <Footer />
          </div>
        )}
      </SessionProvider>
    </Provider>
  );
}
