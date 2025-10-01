"use client";

import {
  ArrowLeft,
  FileText,
  LayoutTemplate,
  CreditCard,
  Globe,
  Repeat,
  Undo2,
  Tag,
  DollarSign,
  ListChecks,
  AlarmClock,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function BillingInvoicing() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const billingRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: "invoice", ref: invoiceRef, icon: <FileText className="text-[#7B53A6]" />, label: "Invoice Generation" },
    { id: "billing", ref: billingRef, icon: <CreditCard className="text-[#7B53A6]" />, label: "Billing" },
    { id: "notes", ref: notesRef, icon: <Undo2 className="text-[#7B53A6]" />, label: "Credit & Debit Notes" },
    { id: "payment", ref: paymentRef, icon: <DollarSign className="text-[#7B53A6]" />, label: "Payment Tracking" },
  ];

  const [activeSection, setActiveSection] = useState<string>("notes");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, id: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMenuOpen(false);
  };

  useEffect(() => {
  if (paymentRef.current) {
    paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
      {/* Fixed Header (Mobile) */}
      <div className="sticky top-0 md:sticky md:top-16 z-50 bg-[#F7FBFB] md:hidden">
        <div className="container mx-auto px-4  py-3 flex items-center justify-between">
          {/* Back Button */}
          <Link href="/services" className="flex items-center text-[#390F59]">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Heading */}
          <h2
            className="text-lg font-extrabold font-roboto text-center flex-1 mr-6"
            style={{ color: "#460F58" }}
          >
            Billing & Invoicing
          </h2>

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-md text-[#390F59]"
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
                className="flex items-center gap-3 p-2 rounded-lg w-full text-left font-semibold border-l-4 font-roboto"
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
          <div className="sticky top-35 md:sticky md:top-13 space-y-6">
            {/* Back Button */}
            <Link href="/services" className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium font-poppins">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>

            {/* Heading */}
            <h2
              className="text-3xl font-extrabold border-b-2 pb-3 font-roboto"
              style={{ borderColor: "#7B53A6", color: "#460F58" }}
            >
              Billing & Invoicing
            </h2>

            {/* Tabs */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.ref, item.id)}
                  className="flex items-center gap-3 p-2 rounded-lg w-full text-left font-semibold border-l-4 font-poppins"
                  style={{
                    borderColor: activeSection === item.id ? "#7B53A6" : "#E5E7EB",
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
        </div>

        {/* Right Content */}
        <div className="md:col-span-8 space-y-16 md:mt-8">
          <Section
            id="invoice"
            ref={invoiceRef}
            title="Invoice Generation"
            items={[
              { icon: <FileText className="w-10 h-10 text-[#7B53A6]" />, title: "Create GST-compliant invoices", description: "Easily generate professional GST-ready invoices with automated tax handling." },
              { icon: <LayoutTemplate className="w-10 h-10 text-[#7B53A6]" />, title: "Custom templates", description: "Design and use personalized invoice templates matching your brand." },
            ]}
          />
          <Section
            id="billing"
            ref={billingRef}
            title="Billing"
            items={[
              { icon: <CreditCard className="w-10 h-10 text-[#7B53A6]" />, title: "Point of Sale (POS)", description: "Integrated POS system for smooth transactions at checkout." },
              { icon: <Globe className="w-10 h-10 text-[#7B53A6]" />, title: "Online billing", description: "Easily create and share bills online with customers in seconds." },
              { icon: <Repeat className="w-10 h-10 text-[#7B53A6]" />, title: "Recurring bills", description: "Automate billing cycles for subscriptions or repeat services." },
            ]}
          />
          <Section
            id="notes"
            ref={notesRef}
            title="Credit & Debit Notes"
            items={[
              { icon: <Undo2 className="w-10 h-10 text-[#7B53A6]" />, title: "Issue adjustments for returns", description: "Easily issue credit notes for product returns and corrections." },
              { icon: <Tag className="w-10 h-10 text-[#7B53A6]" />, title: "Issue adjustments for discounts", description: "Apply debit notes for discounts and manage pricing adjustments." },
            ]}
          />
          <Section
            id="payment"
            ref={paymentRef}
            title="Payment Tracking"
            items={[
              { icon: <DollarSign className="w-10 h-10 text-[#7B53A6]" />, title: "Record payments", description: "Keep an accurate record of all customer payments and receipts." },
              { icon: <ListChecks className="w-10 h-10 text-[#7B53A6]" />, title: "Pending dues", description: "Track unpaid invoices and outstanding balances in real-time." },
              { icon: <AlarmClock className="w-10 h-10 text-[#7B53A6]" />, title: "Payment reminders", description: "Automatically send reminders for upcoming or overdue payments." },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ id, ref, title, items }: any) {
  return (
    <section id={id} ref={ref} className="scroll-mt-25 md:scroll-mt-30">
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
