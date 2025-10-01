



"use client";

import {
  ArrowLeft,
  Package,
  BarChart3,
  Boxes,
  Truck,
  ClipboardList,
  Tags,
  Barcode,
  Bell,
  History,
  Archive,
  Clock,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function InventoryManagementServices() {
  const productRef = useRef<HTMLDivElement>(null);
  const stockRef = useRef<HTMLDivElement>(null);
  const warehouseRef = useRef<HTMLDivElement>(null);
  const supplierRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: "product", ref: productRef, icon: <Package className="text-[#7B53A6]" />, label: "Product Management" },
    { id: "stock", ref: stockRef, icon: <BarChart3 className="text-[#7B53A6]" />, label: "Stock Tracking" },
    { id: "warehouse", ref: warehouseRef, icon: <Boxes className="text-[#7B53A6]" />, label: "Warehouse Management" },
    { id: "supplier", ref: supplierRef, icon: <Truck className="text-[#7B53A6]" />, label: "Supplier Management" },
  ];

  const [activeSection, setActiveSection] = useState<string>("supplier");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, id: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMenuOpen(false); // close menu on mobile after click
  };
  useEffect(() => {
  if (supplierRef.current) {
    supplierRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, []);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { threshold: 0.4 }
    );

    sections.forEach((section) => {
      if (section.ref.current) observer.observe(section.ref.current);
    });

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) observer.unobserve(section.ref.current);
      });
    };
  }, []);

  return (
    <div className="font-poppins bg-[#F7FBFB] sm:px-8 lg:px-10 ">
      {/* Fixed Header */}
      <div className="sticky top-0 md:sticky md:top-16 z-50 bg-[#F7FBFB] ">
        <div className="container mx-auto px-4  py-4 flex items-center justify-between">
          {/* Back Button */}
          <Link
            href="/services"
            className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Back</span>
          </Link>

          {/* Mobile Heading */}
          <h2
            className="text-lg md:hidden font-extrabold font-roboto flex-1 text-center"
            style={{ color: "#460F58" }}
          >
            Inventory Management
          </h2>

          {/* Hamburger (Mobile) */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-md text-[#390F59] hover:bg-[#F7F0FB]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E0E0E0] bg-[#F7FBFB] px-4 py-3 space-y-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.ref, item.id)}
                className="flex items-center gap-3 p-2 rounded-lg w-full text-left font-semibold border-l-4 transition-all font-roboto"
                style={{
                  borderColor: activeSection === item.id ? "#7B53A6" : "#E0E0E0",
                  backgroundColor: activeSection === item.id ? "#F7F0FB" : "transparent",
                  color: activeSection === item.id ? "#390F59" : "#7B53A6",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-4 py-8 grid md:grid-cols-12 gap-8">
        {/* Sidebar (Desktop) */}
        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-35 space-y-4">
            <h2
              className="text-2xl font-extrabold mb-4 font-roboto border-b-2 pb-2"
              style={{ borderColor: "#7B53A6", color: "#460F58" }}
            >
              Inventory Management
            </h2>

            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.ref, item.id)}
                className="flex items-center gap-3 p-2 rounded-lg w-full text-left font-semibold border-l-4 transition-all font-roboto"
                style={{
                  borderColor: activeSection === item.id ? "#7B53A6" : "#E0E0E0",
                  backgroundColor: activeSection === item.id ? "#F7F0FB" : "transparent",
                  color: activeSection === item.id ? "#390F59" : "#7B53A6",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="md:col-span-8 space-y-12">
          <Section
            id="product"
            ref={productRef}
            title="Product Management"
            items={[
              { icon: <Package className="w-10 h-10 text-[#7B53A6]" />, title: "Add, edit, delete products", description: "Easily manage product catalog with detailed fields and categories." },
              { icon: <ClipboardList className="w-10 h-10 text-[#7B53A6]" />, title: "Manage SKUs", description: "Organize products with SKU codes for efficient inventory handling." },
              { icon: <Tags className="w-10 h-10 text-[#7B53A6]" />, title: "Categories", description: "Classify products into categories for easier tracking and reporting." },
              { icon: <Barcode className="w-10 h-10 text-[#7B53A6]" />, title: "HSN codes", description: "Attach HSN/barcodes to products for smooth billing & tax compliance." },
            ]}
          />
          <Section
            id="stock"
            ref={stockRef}
            title="Stock Tracking"
            items={[
              { icon: <BarChart3 className="w-10 h-10 text-[#7B53A6]" />, title: "Monitor stock levels", description: "Real-time stock level updates with automated balance adjustments." },
              { icon: <Bell className="w-10 h-10 text-[#7B53A6]" />, title: "Alerts for low stock", description: "Get notified when stock drops below threshold limits." },
              { icon: <History className="w-10 h-10 text-[#7B53A6]" />, title: "Stock movement history", description: "Track product inflows, outflows, and returns in detail." },
            ]}
          />
          <Section
            id="warehouse"
            ref={warehouseRef}
            title="Warehouse Management"
            items={[
              { icon: <Boxes className="w-10 h-10 text-[#7B53A6]" />, title: "Manage multiple storage locations", description: "Handle multiple warehouses and locations in a single platform." },
              { icon: <Archive className="w-10 h-10 text-[#7B53A6]" />, title: "Batch tracking", description: "Track batches, expiry dates, and product movement across storage." },
            ]}
          />
          <Section
            id="supplier"
            ref={supplierRef}
            title="Supplier Management"
            items={[
              { icon: <Truck className="w-10 h-10 text-[#7B53A6]" />, title: "Maintain supplier details", description: "Keep a detailed record of supplier info, contacts, and agreements." },
              { icon: <ClipboardList className="w-10 h-10 text-[#7B53A6]" />, title: "Purchase orders", description: "Generate and manage supplier POs directly within the system." },
              { icon: <Clock className="w-10 h-10 text-[#7B53A6]" />, title: "History", description: "View supplier transaction history and track order fulfillment." },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ id, ref, title, items }: any) {
  return (
    <section id={id} ref={ref} className="scroll-mt-25 md:scroll-mt-35">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 font-roboto" style={{ color: "#460F58" }}>
        {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            className="flex flex-col space-y-3 p-4 rounded-lg border hover:border-[#7B53A6] transition-all hover:shadow-lg"
            style={{
              backgroundColor: "#F7FBFB",
              boxShadow: "0 4px 6px rgba(123, 83, 166, 0.25)",
            }}
          >
            {item.icon}
            <h3 className="text-lg font-bold font-roboto" style={{ color: "#460F58" }}>
              {item.title}
            </h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
