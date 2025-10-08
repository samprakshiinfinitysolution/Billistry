

import { useState } from "react";
import Image from "next/image";

const featuresData = {
  billing: [
    { src: "/images/automaticinvoice.webp", alt: "Automatic GST Bill Sharing on Whatsapp/SMS", title: "Automatic invoice sharing on SMS & Whatsapp", link: null },
    { src: "/images/sales-purchase.webp ", title: "Sales Purchase and Expenses", link: null },
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
    { src: "/images/multiple-device1.webp", alt: "Access myBillBook on multiple devices", title: "Multiple Device Login" ,link: null},
    { src: "/images/multiple-business1.webp", alt: "Manage Multiple Businesses with one Invoicing Software", title: "Multiple Businesses" ,link: null},
    { src: "/images/multiple-users1.webp", alt: "Provide access to multiple users", title: "Multiple Users",link: null },
    { src: "/images/user-role1.webp", alt: "Create different user roles", title: "User Role Settings" ,link: null},
    { src: "/images/staff-attendance1.webp", alt: "Staff Attendance and Payroll Management", title: "Staff Attendance and Payroll" ,link: null},
    { src: "/images/business-reports1.webp", alt: "Billing Software that Generates Business Reports for free", title: "Business Reports" ,link: null},
  ],
  bonus: [
    { src: "/images/multiple-bank-accounts1.webp", alt: "Multiple Bank Account Management", title: "Multiple Bank Account" ,link: null},
    { src: "/images/bulk-upload.webp", alt: "Bulk Upload/ Edit Invoices", title: "Bulk Upload/ Edit" ,link: null},
    { src: "/images/automated-billing1.webp", alt: "Automated Billing for recurring invoices", title: "Automated Billing",link: null },
    { src: "/images/audit1.webp", alt: "Track Invoice Edit History", title: "Audit Trail", link: null },
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
                  alt={feature.alt || feature.title}
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
