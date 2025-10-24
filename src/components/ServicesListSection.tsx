"use client";

import {
  ShoppingCart, BarChart3, Layers, Receipt, FileText,
  DollarSign, Shield, Package, ClipboardList, Truck,
  Users, Briefcase, PhoneCall, RotateCcw, Boxes,
  TrendingUp, Settings, Cloud, Link as LinkIcon,
  QrCode, Bell, User, UserCircle, FileMinus,
  FileSpreadsheet
} from "lucide-react";

const features = [
  {
    title: "Inventory Management",
    href: "/Inventory_Management_page",
    icon: <Package className="text-[#744D81] w-9 h-9" />,
    description:
      "Create and send online quotations and invoices, track sales, monitor staff performance, and sell & sync all your products via our POS and more.",
    items: [
      { name: "Product Management", href: "/Product_Management", icon: <Package className="w-5 h-5 text-[#744D81]" /> },
      { name: "Stock Tracking", href: "/Stock_Tracking", icon: <BarChart3 className="w-5 h-5 text-[#744D81]" /> },
      { name: "Warehouse Management", href: "/Warehouse_Management", icon: <Boxes className="w-5 h-5 text-[#744D81]" /> },
      { name: "Supplier Management", href: "/Supplier_Management", icon: <Truck className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
  {
    title: "Billing & Invoicing",
    href: "/Billing_Invoicing_page",
    icon: <FileText className="text-[#744D81] w-9 h-9" />,
    description:
      "Manage your cash flow, purchases, taxes, profit & loss, balance sheet, sales, chart of accounts, income statement, assets and more.",
    items: [
      { name: "Invoice Generation", href: "/invoice_Generation", icon: <FileText className="w-5 h-5 text-[#744D81]" /> },
      { name: "Billing", href: "/Billing", icon: <Receipt className="w-5 h-5 text-[#744D81]" /> },
      { name: "Credit & Debit Notes", href: "/Credit_Debit", icon: <FileMinus className="w-5 h-5 text-[#744D81]" /> },
      { name: "Payment Tracking", href: "/Payment_Tracking", icon: <DollarSign className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
  {
    title: "Sales & Purchase",
    href: "/Sales_Purchase_page",
    icon: <ShoppingCart className="text-[#744D81] w-9 h-9" />,
    description:
      "Add unlimited products, control different warehouses, issue purchase orders to your suppliers, follow them with ease and more.",
    items: [
      { name: "Sales Management", href: "/Sales_Management", icon: <ShoppingCart className="w-5 h-5 text-[#744D81]" /> },
      { name: "Purchases Management", href: "/Purchases_Management", icon: <ClipboardList className="w-5 h-5 text-[#744D81]" /> },
      { name: "Return Management", href: "/Return_Management", icon: <RotateCcw className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
  {
    title: "Customer & Vendor",
    href: "/crv_features_page",
    icon: <Users className="text-[#744D81] w-9 h-9" />,
    description:
      "Create clients profiles, add notes, attach files, schedule appointments, reservations, follow up calls/emails or delivery easily and more.",
    items: [
      { name: "Client Management", href: "/Client_Management", icon: <User className="w-5 h-5 text-[#744D81]" /> },
      { name: "Vendor Management", href: "/Vendor_Management", icon: <Users className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
  {
    title: "Reporting & Analytics",
    href: "/Reporting_Analytics_page",
    icon: <BarChart3 className="text-[#744D81] w-9 h-9" />,
    description:
      "Track performance with advanced analytics and generate detailed reports.",
    items: [
      { name: "Inventory Reports", href: "/Inventory_Reports", icon: <Boxes className="w-5 h-5 text-[#744D81]" /> },
      { name: "Sales Reports", href: "/Sales_Reports", icon: <TrendingUp className="w-5 h-5 text-[#744D81]" /> },
      { name: "Financial Reports", href: "/Financial_Reports", icon: <FileSpreadsheet className="w-5 h-5 text-[#744D81]" /> },
      { name: "Custom Reports", href: "/Customs_Reports", icon: <Settings className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
  {
    title: "User & Role Management",
    href: "/User_Role_page",
    icon: <Shield className="text-[#744D81] w-9 h-9" />,
    description:
      "Manage user access and roles across the system with detailed permissions.",
    items: [
      { name: "User Accounts", href: "/User_Accounts", icon: <UserCircle className="w-5 h-5 text-[#744D81]" /> },
      { name: "Permission Control", href: "/Permission_Control", icon: <Shield className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
  {
    title: "Other Services",
    href: "/Other_Services_page",
    icon: <Layers className="text-[#744D81] w-9 h-9" />,
    description:
      "Additional tools and integrations to extend system capabilities.",
    items: [
      { name: "Barcode / QR Code Generation", href: "/Barcode", icon: <QrCode className="w-5 h-5 text-[#744D81]" /> },
      { name: "Notifications", href: "/Notifications", icon: <Bell className="w-5 h-5 text-[#744D81]" /> },
      { name: "Cloud Backup", href: "/Cloud_Backup", icon: <Cloud className="w-5 h-5 text-[#744D81]" /> },
      { name: "Integrations", href: "/Integrations", icon: <LinkIcon className="w-5 h-5 text-[#744D81]" /> },
    ],
  },
];

export default function FeaturesList() {
  return (
    <section className="bg-[#F7FBFB] py-16 px-6 font-poppins ">
  <div className="max-w-7xl mx-auto space-y-20 sm:px-8 lg:px-10">
    {features.map((feature, idx) => (
      <div
        key={idx}
        className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start"
      >
        {/* Left Column */}
        <div className="md:col-span-4">
          <div>
            <a href={feature.href} className="flex items-center underline gap-3">
              {feature.icon}
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#390F59] via-[#744D81] to-[#7B53A6] bg-clip-text text-transparent underline font-roboto">
                {feature.title}
              </h2>
            </a>
            <p className="text-gray-600 text-base leading-relaxed mt-4">
              {feature.description}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 md:col-start-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feature.items.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-3 p-4 bg-white rounded-xl shadow hover:shadow-lg transition border hover:border-[#744D81]"
              >
                {item.icon}
                <span className="font-semibold text-gray-800">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

  );
}
