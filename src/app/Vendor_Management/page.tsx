// "use client";

// import {
//   ArrowLeft,
//   Users,
//   CreditCard,
//   FileText,
//   File,
//   ShoppingCart,
//   FilePlus,
// } from "lucide-react";
// import Link from "next/link";
// import { useRef, useState, useEffect } from "react";

// export default function CustomerVendorServices() {
//   const customerRef = useRef<HTMLDivElement>(null);
//   const vendorRef = useRef<HTMLDivElement>(null);

//   const sections = [
//     { id: "customer", ref: customerRef, icon: <Users className="text-[#7B53A6]" />, label: "Customer Management" },
//     { id: "vendor", ref: vendorRef, icon: <CreditCard className="text-[#7B53A6]" />, label: "Vendor Management" },
//   ];

//   const [activeSection, setActiveSection] = useState<string>("customer");

//   const handleScroll = (ref: React.RefObject<HTMLDivElement>, id: string) => {
//     ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//     setActiveSection(id);
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         const visible = entries.find((entry) => entry.isIntersecting);
//         if (visible) setActiveSection(visible.target.id);
//       },
//       { threshold: 0.3 }
//     );

//     sections.forEach((section) => {
//       if (section.ref.current) observer.observe(section.ref.current);
//     });

//     return () => {
//       sections.forEach((section) => {
//         if (section.ref.current) observer.unobserve(section.ref.current);
//       });
//     };
//   }, []);

//   return (
//     <div className="feature-page py-16 font-poppins" style={{ backgroundColor: "#F7FBFB" }}>
//   <div className="container mx-auto px-4">
//     <div className="grid md:grid-cols-12 gap-8">
//       {/* Sidebar */}
//       <div className="md:col-span-4">
//         <div className="sticky top-20 space-y-6">
//           <Link
//             href="/services"
//             className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium font-poppins"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Link>
//           <h2
//             className="text-3xl font-extrabold border-b-2 pb-3 font-roboto"
//             style={{ borderColor: "#7B53A6", color: "#460F58" }}
//           >
//             Customer & Vendor
//           </h2>
//           <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
//             {sections.map((item) => (
//               <button
//                 key={item.id}
//                 id={`tab-${item.id}`}
//                 onClick={() => handleScroll(item.ref, item.id)}
//                 className="flex items-center gap-3 p-2 rounded-lg w-full text-left font-semibold border-l-4 transition-all font-poppins"
//                 style={{
//                   borderColor: activeSection === item.id ? "#7B53A6" : "#E0E0E0",
//                   backgroundColor: activeSection === item.id ? "#F7F0FB" : "transparent",
//                   color: activeSection === item.id ? "#390F59" : "#7B53A6",
//                 }}
//               >
//                 {item.icon}
//                 {item.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Right Content */}
//       <div className="md:col-span-8 space-y-16">
//         <Section
//           id="customer"
//           ref={customerRef}
//           title="Customer Management"
//           items={[
//             { icon: <FileText className="w-10 h-10 text-[#7B53A6]" />, title: "Maintain customer profiles", description: "Easily record customer information and manage detailed profiles." },
//             { icon: <Users className="w-10 h-10 text-[#7B53A6]" />, title: "Contact info", description: "Store and update all customer contact information in one place." },
//             { icon: <ShoppingCart className="w-10 h-10 text-[#7B53A6]" />, title: "Purchase history", description: "Track customer purchases, invoices, and transaction history." },
//           ]}
//         />
//         <Section
//           id="vendor"
//           ref={vendorRef}
//           title="Vendor Management"
//           items={[
//             { icon: <CreditCard className="w-10 h-10 text-[#7B53A6]" />, title: "Track vendor contacts", description: "Maintain detailed information for all vendors and suppliers." },
//             { icon: <FilePlus className="w-10 h-10 text-[#7B53A6]" />, title: "Transactions", description: "Record and manage supplier bills and payments efficiently." },
//             { icon: <File className="w-10 h-10 text-[#7B53A6]" />, title: "Ratings", description: "Track and rate vendor performance for better decisions." },
//           ]}
//         />
//       </div>
//     </div>
//   </div>
// </div>
//   );
// }

// function Section({ id, ref, title, items }: any) {
//   return (
//     <section id={id} ref={ref} className="scroll-mt-28 font-poppins">
//       <h2 className="text-4xl font-extrabold mb-10 font-roboto" style={{ color: "#460F58" }}>{title}</h2>
//       <div className="grid md:grid-cols-2 gap-8">
//         {items.map((item: any, i: number) => (
//           <div
//             key={i}
//             className="flex flex-col space-y-3 p-4 rounded-lg border hover:border-[#7B53A6] transition-all hover:shadow-lg"
//             style={{
//               backgroundColor: "#F7FBFB",
//               boxShadow: "0 4px 6px rgba(123, 83, 166, 0.25)",
//             }}
//           >
//             {item.icon}
//             <h3 className="text-lg font-bold font-roboto" style={{ color: "#460F58" }}>{item.title}</h3>
//             <p className="text-sm text-gray-500">{item.description}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }


"use client";

import {
  ArrowLeft,
  Users,
  CreditCard,
  FileText,
  File,
  ShoppingCart,
  FilePlus,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function CustomerVendorServices() {
  const customerRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "customer",
      ref: customerRef,
      icon: <Users className="text-[#7B53A6]" />,
      label: "Customer Management",
    },
    {
      id: "vendor",
      ref: vendorRef,
      icon: <CreditCard className="text-[#7B53A6]" />,
      label: "Vendor Management",
    },
  ];

  const [activeSection, setActiveSection] = useState<string>("vendor");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    id: string
  ) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMenuOpen(false); // auto close hamburger after click
  };

  useEffect(() => {
  if (vendorRef.current) {
    vendorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, []);


  // Intersection Observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { threshold: 0.3 }
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
      {/* Fixed Top Header */}
       <div className="sticky top-0 md:sticky md:top-16  z-50 bg-[#F7FBFB]">
    <div className="container mx-auto px-4  py-4 flex items-center justify-between">
      {/* Back Button */}
      <Link
        href="/services"
        className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="hidden md:inline">Back</span>
      </Link>

      {/* Heading for mobile: center */}
      <h2
        className="text-lg md:hidden font-extrabold font-roboto flex-1 text-center"
        style={{ color: "#460F58" }}
      >
        Customer & Vendor
      </h2>

      {/* Hamburger for mobile */}
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

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8 grid md:grid-cols-12 gap-8">
    
    {/* Left Sidebar + Heading (Desktop) */}
    <div className="hidden md:block md:col-span-4">
      <div className="sticky top-35 space-y-4">
        {/* Heading under Back Button */}
        <h2
          className="text-2xl font-extrabold mb-4 font-roboto border-b-2 pb-2"
          style={{ borderColor: "#7B53A6", color: "#460F58" }}
        >
           Customer & Vendor
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
          <div className="md:col-span-8 space-y-16">
            <Section
              id="customer"
              ref={customerRef}
              title="Customer Management"
              items={[
                {
                  icon: (
                    <FileText className="w-10 h-10 text-[#7B53A6]" />
                  ),
                  title: "Maintain customer profiles",
                  description:
                    "Easily record customer information and manage detailed profiles.",
                },
                {
                  icon: <Users className="w-10 h-10 text-[#7B53A6]" />,
                  title: "Contact info",
                  description:
                    "Store and update all customer contact information in one place.",
                },
                {
                  icon: (
                    <ShoppingCart className="w-10 h-10 text-[#7B53A6]" />
                  ),
                  title: "Purchase history",
                  description:
                    "Track customer purchases, invoices, and transaction history.",
                },
              ]}
            />
            <Section
              id="vendor"
              ref={vendorRef}
              title="Vendor Management"
              items={[
                {
                  icon: (
                    <CreditCard className="w-10 h-10 text-[#7B53A6]" />
                  ),
                  title: "Track vendor contacts",
                  description:
                    "Maintain detailed information for all vendors and suppliers.",
                },
                {
                  icon: (
                    <FilePlus className="w-10 h-10 text-[#7B53A6]" />
                  ),
                  title: "Transactions",
                  description:
                    "Record and manage supplier bills and payments efficiently.",
                },
                {
                  icon: <File className="w-10 h-10 text-[#7B53A6]" />,
                  title: "Ratings",
                  description:
                    "Track and rate vendor performance for better decisions.",
                },
              ]}
            />
          </div>
        </div>
      </div>
   
  );
}

// Section Component
function Section({ id, ref, title, items }: any) {
  return (
    // ⬇ Adjust scroll-mt to match sticky header height
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
