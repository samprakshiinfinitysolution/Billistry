// "use client";

// import {
//   ArrowLeft,
//   Users,
//   Shield,
//   UserCheck,
//   ShoppingCart,
// } from "lucide-react";
// import Link from "next/link";
// import { useRef, useState, useEffect } from "react";

// export default function UserRoleManagement() {
//   const userAccountsRef = useRef<HTMLDivElement>(null);
//   const permissionRef = useRef<HTMLDivElement>(null);

//   const sections = [
//     { id: "userAccounts", ref: userAccountsRef, icon: <Users className="text-[#7B53A6]" />, label: "User Accounts" },
//     { id: "permissionControl", ref: permissionRef, icon: <Shield className="text-[#7B53A6]" />, label: "Permission Control" },
//   ];

//   const [activeSection, setActiveSection] = useState<string>("userAccounts");

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
//             className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Link>
//           <h2
//             className="text-3xl font-extrabold border-b-2 pb-3 font-roboto"
//             style={{ borderColor: "#7B53A6", color: "#460F58" }}
//           >
//             User & Role Management
//           </h2>
//           <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
//             {sections.map((item) => (
//               <button
//                 key={item.id}
//                 id={`tab-${item.id}`}
//                 onClick={() => handleScroll(item.ref, item.id)}
//                 className="flex items-center gap-3 p-2 rounded-lg w-full text-left font-semibold border-l-4 transition-all"
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
//           id="userAccounts"
//           ref={userAccountsRef}
//           title="User Accounts"
//           items={[
//             { icon: <UserCheck className="w-10 h-10 text-[#7B53A6]" />, title: "Admin", description: "Full access for administrators with all permissions." },
//             { icon: <Users className="w-10 h-10 text-[#7B53A6]" />, title: "Staff", description: "Manage staff users with limited access and roles." },
//             { icon: <ShoppingCart className="w-10 h-10 text-[#7B53A6]" />, title: "Shopkeeper", description: "Assign shopkeeper roles to manage sales and inventory." },
//           ]}
//         />
//         <Section
//           id="permissionControl"
//           ref={permissionRef}
//           title="Permission Control"
//           items={[
//             { icon: <Shield className="w-10 h-10 text-[#7B53A6]" />, title: "Access Management", description: "Define what each user can view, edit, or manage." },
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
//       <h2 className="text-4xl font-extrabold mb-10 font-roboto" style={{ color: "#460F58" }}>
//         {title}
//       </h2>
//       <div className="grid md:grid-cols-2 gap-8">
//         {items.map((item: any, i: number) => (
//           <div
//             key={i}
//             className="flex flex-col space-y-3 p-4 rounded-lg border hover:border-[#7B53A6] transition-all hover:shadow-lg"
//             style={{
//               backgroundColor: "#F7FBFB",
//               boxShadow: "0 4px 6px rgba(123,83,166,0.25)",
//             }}
//           >
//             {item.icon}
//             <h3 className="text-lg font-bold font-roboto" style={{ color: "#460F58" }}>
//               {item.title}
//             </h3>
//             <p className="text-sm text-gray-500">
//               {item.description}
//             </p>
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
  Shield,
  UserCheck,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function UserRoleManagement() {
  const userAccountsRef = useRef<HTMLDivElement>(null);
  const permissionRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "userAccounts",
      ref: userAccountsRef,
      icon: <Users className="text-[#7B53A6]" />,
      label: "User Accounts",
      items: [
        { icon: <UserCheck className="w-10 h-10 text-[#7B53A6]" />, title: "Admin", description: "Full access for administrators with all permissions." },
        { icon: <Users className="w-10 h-10 text-[#7B53A6]" />, title: "Staff", description: "Manage staff users with limited access and roles." },
        { icon: <ShoppingCart className="w-10 h-10 text-[#7B53A6]" />, title: "Shopkeeper", description: "Assign shopkeeper roles to manage sales and inventory." },
      ],
    },
    {
      id: "permissionControl",
      ref: permissionRef,
      icon: <Shield className="text-[#7B53A6]" />,
      label: "Permission Control",
      items: [
        { icon: <Shield className="w-10 h-10 text-[#7B53A6]" />, title: "Access Management", description: "Define what each user can view, edit, or manage." },
      ],
    },
  ];

  const [activeSection, setActiveSection] = useState<string>("userAccounts");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, id: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMenuOpen(false);
  };

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
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/services" className="flex items-center text-[#390F59] hover:text-[#460F58] text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Back</span>
          </Link>

          <h2 className="text-lg md:hidden font-extrabold font-roboto flex-1 text-center" style={{ color: "#460F58" }}>
            User & Role Management
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
              User & Role Management
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
    <section id={id} ref={ref} className="scroll-mt-53 md:scroll-mt-35">
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
