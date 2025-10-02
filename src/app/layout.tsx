// // app/layout.tsx
// import type { Metadata } from 'next';
// import ClientLayout from '@/components/ClientLayout';
// import './globals.css';



// export const metadata: Metadata = {
//   title: {
//     default: "Billistry",
//     template: "%s | Inventory Management",
//   },
//   description: "Complete inventory management solution for businesses",
//   keywords: ["inventory", "management", "business", "stock", "warehouse"],
//   authors: [{ name: "Billistry Team" }],
//   creator: "Billistry",
//   publisher: "Billistry",
//   robots: {
//     index: true,
//     follow: true,
//   },
//   openGraph: {
//     type: "website",
//     locale: "en_US",
//     url: "https://www.billistry.com",
//     title: "Billistry",
//     description: "Complete inventory management solution for businesses",
//     siteName: "Billistry",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Billistry",
//     description: "Complete inventory management solution for businesses",
//   },
// };


// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-gray-50">
//         <ClientLayout>{children}</ClientLayout>
//       </body>
//     </html>
//   );
// }




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
      <head>
        {/* Google Fonts CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
<link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Toaster position="top-right" />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
