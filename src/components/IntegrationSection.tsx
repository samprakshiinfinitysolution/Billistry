// // src/components/IntegrationSection.tsx
// export default function IntegrationSection() {
//   const tools = ['Shopify', 'Google Sheets', 'Slack', 'WhatsApp', 'Zapier', 'QuickBooks']
//   return (
//     <section className="bg-white py-20 px-6">
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-6">Works With Your Favorite Tools</h2>
//         <p className="text-gray-600 mb-12">Seamlessly connect your existing stack</p>
//         <div className="flex flex-wrap justify-center gap-6">
//           {tools.map((tool, idx) => (
//             <span key={idx} className="bg-gray-100 text-gray-800 px-6 py-3 rounded-full shadow text-sm font-medium">
//               {tool}
//             </span>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }


// // src/components/IntegrationSection.tsx
// export default function IntegrationSection() {
//   const tools = ['Shopify', 'Google Sheets', 'Slack', 'WhatsApp', 'Zapier', 'QuickBooks']

//   return (
//     <section className="bg-[#F9FAFB] py-20 px-6 sm:px-10 lg:px-16 font-['Poppins']">
//       <div className="max-w-6xl mx-auto text-center">
//         {/* Heading */}
//         <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#3B3D72] to-[#6C63FF]  bg-clip-text text-transparent">
//           Works With Your Favorite Tools
//         </h2>

//         {/* Subtext */}
//         <p className="text-[#4B5563] mb-12 text-lg">
//           Seamlessly connect your existing stack
//         </p>

//         {/* Tools */}
//         <div className="flex flex-wrap justify-center gap-6">
//           {tools.map((tool, idx) => (
//             <span
//               key={idx}
//               className="bg-white border border-gray-200 text-[#1E1E2F] px-6 py-3 rounded-full shadow text-sm font-medium hover:shadow-lg hover:border-indigo-400 transition duration-300"
//             >
//               {tool}
//             </span>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

import { useState } from "react";
import Image from "next/image";

const featuresData = {
  billing: [
    { src: "/images/automaticinvoice.webp", alt: "Automatic GST Bill Sharing on Whatsapp/SMS", title: "Automatic invoice sharing on SMS & Whatsapp", link: null },
    { src: "/images/Bsales.webp", alt: "Sales & Purchase Invoices, Expense Tracking", title: "Sales Purchase and Expenses", link: null },
    { src: "/images/invoice.webp", alt: "Create Quotations/Estimates & Proforma Invoices", title: "Quotations Estimates & Proforma Invoices", link: null },
    { src: "/images/Deliverychallan.webp", alt: "Create Delivery Challan", title: "Delivery Challan", link: null },
  ],
  inventory: [
    { src: "/images/stockm.webp", alt: "Inventory Management Software", title: "Manage Stock Items" ,link: null},
    { src: "/images/godownm.webp", alt: "Godown Management Billing Software", title: "Godown Management",link: null },
    { src: "/images/batchingm.webp", alt: "Product Batching Feature", title: "Batching" ,link: null},
    { src: "/images/serialization.webp", alt: "Add Serial Number for easy product tracking", title: "Serialisation",link: null},
    { src: "/images/Print.webp", alt: "Create and Print Barcodes", title: "Generate and Print Barcodes" ,link: null},
    { src: "/images/inventorycustom.webp", alt: "Add custom fields for easy inventory management", title: "Inventory Custom Fields" ,link: null},
  ],
  business: [
    { src: "/images/multiple-device.webp", alt: "Access myBillBook on multiple devices", title: "Multiple Device Login" ,link: null},
    { src: "/images/multiple-business.webp", alt: "Manage Multiple Businesses with one Invoicing Software", title: "Multiple Businesses" ,link: null},
    { src: "/images/multiple-users.webp", alt: "Provide access to multiple users", title: "Multiple Users",link: null },
    { src: "/images/user-role.webp", alt: "Create different user roles", title: "User Role Settings" ,link: null},
    { src: "/images/staff-attendance.webp", alt: "Staff Attendance and Payroll Management", title: "Staff Attendance and Payroll" ,link: null},
    { src: "/images/business-reports.webp", alt: "Billing Software that Generates Business Reports for free", title: "Business Reports" ,link: null},
  ],
  bonus: [
    { src: "/images/multiple-bank-accounts.webp", alt: "Multiple Bank Account Management", title: "Multiple Bank Account" ,link: null},
    { src: "/images/bulk-upload.webp", alt: "Bulk Upload/ Edit Invoices", title: "Bulk Upload/ Edit" ,link: null},
    { src: "/images/automated-billing.webp", alt: "Automated Billing for recurring invoices", title: "Automated Billing",link: null },
    { src: "/images/audit.webp", alt: "Track Invoice Edit History", title: "Audit Trail", link: null },
  ],
};

type FeatureTabKey = keyof typeof featuresData;

const tabs = [
  { key: "billing" as FeatureTabKey, label: "Billing" },
  { key: "inventory" as FeatureTabKey, label: "Inventory Management" },
  { key: "business" as FeatureTabKey, label: "Business Management" },
  { key: "bonus" as FeatureTabKey, label: "Bonus Features" },
];

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<FeatureTabKey>("billing");

  return (
    <section className="bg-[#F7FBFB] py-16 px-4 sm:px-6 md:px-10  ">
      <div className="max-w-7xl mx-auto sm:px-8 lg:px-10">
        {/* Heading */}
        <div className="text-center mb-10 px-2">
           <h2
             className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 
             bg-gradient-to-r from-[#390F59] via-[#460F58] to-[#7B53A6] bg-clip-text text-transparent"
             style={{ fontFamily: "Roboto, sans-serif" }} // ✅ Roboto for heading
           >
             Billistry: Effortless Invoice Management
           </h2>
           <p className="text-base sm:text-lg md:text-xl text-gray-500"   style={{ fontFamily: "Poppins, sans-serif" }} >
             Organize your invoices and accelerate <span className="text-[#7B53A6] font-semibold">business growth</span>
         </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-10 ">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full font-semibold text-sm sm:text-base transition-all duration-300
                ${activeTab === tab.key
                  ? "bg-[#460F58] text-[#F7FBFB] shadow-md"
                  : "bg-[#F7FBFB] text-[#390F59] border border-[#744D81] hover:bg-[#7B53A6] hover:text-[#F7FBFB]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {featuresData[activeTab].map((feature, idx) => (
            <a
              key={idx}
              href={feature.link || "#"}
              className="rounded-2xl shadow-md p-4 flex flex-col items-center text-center
                 hover:shadow-lg hover:scale-105 transition-transform duration-300 border border-[#E5E7EB] hover:border-[#7B53A6] bg-[#F7FBFB]"
            >
              <div className="w-full h-48 sm:h-52 md:h-56 relative mb-3">
                <Image
                  src={feature.src}
                  alt={feature.alt}
                  fill
                  className="object-contain rounded-xl"
                  sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 27vw"
                />
              </div>
              <p className="text-[#390F59] font-semibold text-sm sm:text-base">{feature.title}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


// import { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

// const featuresData = {
//   billing: [
//     { src: "/images/automatic-invoice.webp", alt: "Automatic GST Bill Sharing on Whatsapp/SMS", title: "Automatic invoice sharing on SMS & Whatsapp", link: null },
//     { src: "/images/sales-purchase.webp", alt: "Sales & Purchase Invoices, Expense Tracking", title: "Sales Purchase and Expenses", link: null },
//     { src: "/images/quotation-proforma.webp", alt: "Create Quotations/Estimates & Proforma Invoices", title: "Quotations Estimates & Proforma Invoices", link: null },
//     { src: "/images/delivery-challan.webp", alt: "Create Delivery Challan", title: "Delivery Challan", link: "https://mybillbook.in/blog/delivery-challan-meaning-and-format/" },
//   ],
//   inventory: [
//     { src: "/images/manage-stocks.webp", alt: "Inventory Management Software", title: "Manage Stock Items" },
//     { src: "/images/godown.webp", alt: "Godown Management Billing Software", title: "Godown Management" },
//     { src: "/images/batching.webp", alt: "Product Batching Feature", title: "Batching" },
//     { src: "/images/serialisation.webp", alt: "Add Serial Number for easy product tracking", title: "Serialisation" },
//     { src: "/images/barcodes.webp", alt: "Create and Print Barcodes", title: "Generate and Print Barcodes", link: "https://mybillbook.in/s/billing-software-with-barcode/" },
//     { src: "/images/custom-fields.webp", alt: "Add custom fields for easy inventory management", title: "Inventory Custom Fields" },
//   ],
//   business: [
//     { src: "/images/multiple-device.webp", alt: "Access myBillBook on multiple devices", title: "Multiple Device Login" },
//     { src: "/images/multiple-business.webp", alt: "Manage Multiple Businesses with one Invoicing Software", title: "Multiple Businesses" },
//     { src: "/images/multiple-users.webp", alt: "Provide access to multiple users", title: "Multiple Users" },
//     { src: "/images/user-role.webp", alt: "Create different user roles", title: "User Role Settings" },
//     { src: "/images/staff-attendance.webp", alt: "Staff Attendance and Payroll Management", title: "Staff Attendance and Payroll", link: "https://mybillbook.in/s/attendance-managment-system/how-to-use-staff-and-attendance-management/" },
//     { src: "/images/business-reports.webp", alt: "Billing Software that Generates Business Reports for free", title: "Business Reports" },
//   ],
//   bonus: [
//     { src: "/images/multiple-bank-accounts.webp", alt: "Multiple Bank Account Management", title: "Multiple Bank Account", link: "https://mybillbook.in/s/banking/multiple-bank-accounts-in-your-billing-software/" },
//     { src: "/images/bulk-upload.webp", alt: "Bulk Upload/ Edit Invoices", title: "Bulk Upload/ Edit" },
//     { src: "/images/automated-billing.webp", alt: "Automated Billing for recurring invoices", title: "Automated Billing", link: "https://mybillbook.in/s/how-to-use-automated-billing-feature-in-mybillbook/" },
//     { src: "/images/audit.webp", alt: "Track Invoice Edit History", title: "Audit Trail" },
//   ],
// };

// const tabs = [
//   { key: "billing", label: "Billing" },
//   { key: "inventory", label: "Inventory Management" },
//   { key: "business", label: "Business Management" },
//   { key: "bonus", label: "Bonus Features" },
// ];
// export default function FeaturesSection() {
//   const [activeTab, setActiveTab] = useState("billing");
//   const scrollRef = useRef(null);

//   // Smooth continuous scroll using requestAnimationFrame
//   useEffect(() => {
//   let scrollAmount = 0;
//   let rafId;

//   const smoothScroll = () => {
//     if (scrollRef.current) {
//       scrollAmount += 1; // <-- increased speed from 0.5 to 1
//       if (scrollAmount >= scrollRef.current.scrollWidth / 2) {
//         scrollAmount = 0;
//       }
//       scrollRef.current.style.transform = `translateX(-${scrollAmount}px)`;
//       rafId = requestAnimationFrame(smoothScroll);
//     }
//   };

//   // Duplicate children for infinite scroll
//   const container = scrollRef.current;
//   if (container) {
//     const children = Array.from(container.children);
//     children.forEach(child => {
//       const clone = child.cloneNode(true);
//       container.appendChild(clone);
//     });
//   }

//   rafId = requestAnimationFrame(smoothScroll);

//   return () => cancelAnimationFrame(rafId);
// }, [activeTab]);


//    return (
//     <section className="bg-[#F9FAFB] py-16 px-4 sm:px-6 md:px-10 font-['Poppins']">
//       <div className="max-w-7xl mx-auto">
//         {/* Heading */}
//         <div className="text-center mb-10 px-2">
//           <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#3B3D72] mb-1">
//             Billistry: Effortless Invoice Management
//           </h2>
//           <p className="text-base sm:text-lg md:text-xl text-gray-600">
//             Organize your invoices and accelerate <span className="text-[#6C63FF] font-semibold">business growth</span>
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex flex-wrap justify-center gap-3 mb-8">
//           {tabs.map(tab => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`px-4 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300
//                 ${activeTab === tab.key
//                   ? "bg-[#3B3D72] text-white shadow-md"
//                   : "bg-white text-[#1E1E2F] border border-gray-300 hover:bg-[#6C63FF] hover:text-white"
//                 }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Horizontal Scroll Carousel */}
//         <div className="overflow-x-auto no-scrollbar">
//           <div
//             ref={scrollRef}
//             className="flex gap-6 flex-nowrap will-change-transform"
//           >
//             {featuresData[activeTab].map((feature, idx) => (
//               <div
//                 key={idx}
//                 className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[350px] lg:w-[400px] rounded-2xl overflow-hidden shadow-lg bg-white transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
//               >
//                 <div className="relative w-full h-52 sm:h-56 md:h-60 lg:h-64">
//                   <Image
//                     src={feature.src}
//                     alt={feature.alt}
//                     fill
//                     className="object-cover transition-transform duration-500"
//                     sizes="(max-width: 640px) 80vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent"></div>
//                 </div>
//                 <div className="p-4 sm:p-5 text-center">
//                   <p className="text-sm sm:text-base md:text-lg font-semibold text-[#1E1E2F]">
//                     {feature.title}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
