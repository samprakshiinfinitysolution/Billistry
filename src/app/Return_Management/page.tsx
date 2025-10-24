"use client";

import {
  ArrowLeft,
  ShoppingCart,
  FileText,
  CreditCard,
  Undo2,
  Tag,
  File,
  FilePlus,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect, RefObject } from "react";

export default function SalesPurchaseServices() {
  const salesRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const purchaseRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const returnRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;

  const sections = [
    {
      id: "sales",
      ref: salesRef,
      icon: <ShoppingCart className="text-[#7B53A6]" />,
      label: "Sales Management",
      items: [
        { icon: <File className="w-10 h-10 text-[#7B53A6]" />, title: "Record sales", description: "Easily record sales, manage customers, and track detailed sales reports." },
        { icon: <ShoppingCart className="w-10 h-10 text-[#7B53A6]" />, title: "Sales reports", description: "Generate comprehensive reports to analyze sales performance and trends." },
      ],
    },
    {
      id: "purchase",
      ref: purchaseRef,
      icon: <CreditCard className="text-[#7B53A6]" />,
      label: "Purchase Management",
      items: [
        { icon: <CreditCard className="w-10 h-10 text-[#7B53A6]" />, title: "Track purchase orders", description: "Manage and monitor all purchase orders efficiently." },
        { icon: <FilePlus className="w-10 h-10 text-[#7B53A6]" />, title: "Bills from suppliers", description: "Easily record and manage supplier bills for smooth operations." },
      ],
    },
    {
      id: "returns",
      ref: returnRef,
      icon: <Undo2 className="text-[#7B53A6]" />,
      label: "Return Management",
      items: [
        { icon: <Undo2 className="w-10 h-10 text-[#7B53A6]" />, title: "Handle purchase returns", description: "Easily manage product returns and adjustments." },
        { icon: <Tag className="w-10 h-10 text-[#7B53A6]" />, title: "Sales returns", description: "Track and manage returns from customers seamlessly." },
      ],
    },
  ];

  const [activeSection, setActiveSection] = useState<string>("returns");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, id: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMenuOpen(false);
  };

  useEffect(() => {
  if (returnRef.current) {
    returnRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
      if (section.ref?.current) observer.observe(section.ref.current);
    });

    return () => {
      sections.forEach((section) => {
        if (section.ref?.current) observer.unobserve(section.ref.current);
      });
    };
  }, [sections]);

  return (
    <div className="font-poppins bg-[#F7FBFB] sm:px-8 lg:px-10 ">
      {/* Header */}
      <div className="sticky top-0 md:top-16 z-50 bg-[#F7FBFB] ">
        <div className="container mx-auto px-4  py-4 flex items-center justify-between">
          <Link href="/services" className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Back</span>
          </Link>

          <h2 className="text-lg md:hidden font-extrabold font-roboto flex-1 text-center" style={{ color: "#460F58" }}>
            Sales & Purchase
          </h2>

          <button
            className="md:hidden flex items-center justify-center p-2 rounded-md text-[#390F59] hover:bg-[#F7F0FB]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E0E0E0] bg-[#F7FBFB] px-4 py-3 space-y-2">
            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.ref!, item.id)}
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
        {/* Sidebar (desktop) */}
        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-35 space-y-4">
            <h2 className="text-2xl font-extrabold mb-4 font-roboto border-b-2 pb-2" style={{ borderColor: "#7B53A6", color: "#460F58" }}>
              Sales & Purchase
            </h2>

            {sections.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.ref!, item.id)}
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
          {sections.map((section) => (
            <Section key={section.id} id={section.id} ref={section.ref!} title={section.label} items={section.items} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Section Component
function Section({ id, ref, title, items }: any) {
  return (
    <section id={id} ref={ref} className="scroll-mt-25 md:scroll-mt-35">
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 font-roboto" style={{ color: "#460F58" }}>
        {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item: any, i: number) => (
          <div key={i} className="flex flex-col space-y-3 p-4 rounded-lg border hover:border-[#7B53A6] transition-all hover:shadow-lg" style={{ backgroundColor: "#F7FBFB", boxShadow: "0 4px 6px rgba(123,83,166,0.25)" }}>
            {item.icon}
            <h3 className="text-lg font-bold font-roboto" style={{ color: "#460F58" }}>{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
