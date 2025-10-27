


// app/layout.tsx
import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Billistry",
    template: "%s | Inventory Management",
  },
  verification: {
    google: 'AKucHrsElZd8_4wCZTxdvkuCHmM74rlQ_Wu_eLuoevI',
  },
  description: "Complete inventory management solution for businesses",
  keywords: ["inventory", "management", "business", "stock", "warehouse"],
  authors: [{ name: "Billistry Team" }],
  creator: "Billistry",
  publisher: "Billistry",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.billistry.com",
    title: "Billistry",
    description: "Complete inventory management solution for businesses",
    siteName: "Billistry",
  },
  twitter: {
    card: "summary_large_image",
    title: "Billistry",
    description: "Complete inventory management solution for businesses",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <Toaster position="top-right" />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
