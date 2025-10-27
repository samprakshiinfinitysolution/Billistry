import React from 'react';

export const metadata = {
  title: 'Print - Invoice',
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  // Do not render ClientLayout here; keep the page minimal and focused on printable content
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {children}
    </div>
  );
}
