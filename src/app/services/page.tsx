// "use client";

// import { useState } from "react";
// import { Package, FileText, ShoppingCart, Users, BarChart3, Shield, Layers } from "lucide-react";

// const services = [
//   {
//     title: "Inventory Management Services",
//     icon: <Package className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "Product Management – Add, edit, delete products; manage SKUs, categories, and HSN codes.",
//       "Stock Tracking – Monitor stock levels, alerts for low stock, and stock movement history.",
//       "Warehouse Management – Manage multiple storage locations, batch tracking.",
//       "Supplier Management – Maintain supplier details, purchase orders, and history.",
//     ],
//   },
//   {
//     title: "Billing & Invoicing Services",
//     icon: <FileText className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "Invoice Generation – Create GST-compliant invoices, custom templates.",
//       "Billing – Point of Sale (POS) or online billing, recurring bills.",
//       "Credit & Debit Notes – Issue adjustments for returns or discounts.",
//       "Payment Tracking – Record payments, pending dues, and payment reminders.",
//     ],
//   },
//   {
//     title: "Sales & Purchase Services",
//     icon: <ShoppingCart className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "Sales Management – Record sales, manage customers, sales reports.",
//       "Purchase Management – Track purchase orders, bills from suppliers.",
//       "Return Management – Handle purchase returns and sales returns.",
//     ],
//   },
//   {
//     title: "Customer & Vendor Services",
//     icon: <Users className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "Customer Management – Maintain customer profiles, contact info, purchase history.",
//       "Vendor Management – Keep track of vendor contacts, transactions, and ratings.",
//     ],
//   },
//   {
//     title: "Reporting & Analytics",
//     icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "Inventory Reports – Stock reports, valuation, expiry alerts.",
//       "Sales Reports – Daily, weekly, monthly sales, top-selling products.",
//       "Financial Reports – Profit & loss, GST reports, balance sheets.",
//       "Custom Reports – Filtered reports for any date range or category.",
//     ],
//   },
//   {
//     title: "User & Role Management",
//     icon: <Shield className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "User Accounts – Admin, staff, and shopkeeper roles.",
//       "Permission Control – Define what each user can view or edit.",
//     ],
//   },
//   {
//     title: "Other Services",
//     icon: <Layers className="w-6 h-6 text-indigo-600" />,
//     items: [
//       "Barcode / QR Code Generation – For easy scanning and inventory updates.",
//       "Notifications – Low stock alerts, payment reminders, expiry alerts.",
//       "Cloud Backup – Secure storage of all data.",
//       "Integration – Connect with accounting software, payment gateways, or e-commerce platforms.",
//     ],
//   },
// ];

// export default function ServicesPage() {
//   const [activeTab, setActiveTab] = useState(0);

//   return (
//     <section className="bg-gray-50 py-16 px-6 font-['Poppins'] min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Heading */}
//         <h2 className="text-4xl sm:text-5xl font-extrabold text-[#3B3D72] text-center mb-12">
//           Our Services
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Tabs */}
//           <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
//             {services.map((service, i) => (
//               <button
//                 key={i}
//                 onClick={() => setActiveTab(i)}
//                 className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${
//                   activeTab === i
//                     ? "bg-gradient-to-r from-[#3B3D72] to-[#6C63FF] text-white shadow-lg border-transparent"
//                     : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 {service.icon}
//                 {service.title}
//               </button>
//             ))}
//           </div>

//           {/* Right-side Tab Content - Perfectly aligned timeline */}
//           <div className="md:col-span-3 bg-white p-8 rounded-2xl shadow-lg border border-gray-200 relative">
//             <div className="relative">
//               {/* Vertical Line */}
//               <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

//               <div className="ml-12">
//                 {services[activeTab].items.map((item, idx) => {
//                   const [heading, desc] = item.split(" – "); // Split by first '–'

//                   return (
//                     <div key={idx} className="relative mb-8 last:mb-0">
//                       {/* Circle */}
                      

//                       <h4 className="font-bold text-[#3B3D72] text-lg mb-2">{heading?.trim()}</h4>
//                       <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{desc?.trim()}</p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
import ServicesHeader from "@/components/ServicesHeaderSection";
import ServicesList from "@/components/ServicesListSection";


export default function Home() {
  return (
    <>
      
      <ServicesHeader/>
      <ServicesList/>
     
    </>
  );
}

