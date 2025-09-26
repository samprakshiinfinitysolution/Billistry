// app/components/BillistrySidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaUsers, FaBuilding, FaBoxOpen, FaCog } from "react-icons/fa";

interface SidebarLink {
  name: string;
  href: string;
  icon: JSX.Element;
}

const links: SidebarLink[] = [
  { name: "Dashboard", href: "/billistry-company/dashboard", icon: <FaTachometerAlt /> },
  { name: "Users", href: "/billistry-company/users", icon: <FaUsers /> },
  { name: "Businesses", href: "/billistry-company/business", icon: <FaBuilding /> },
  { name: "Products", href: "/billistry-company/products", icon: <FaBoxOpen /> },
  { name: "Settings", href: "/billistry-company/settings", icon: <FaCog /> },
];

export default function BillistrySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Billistry</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className={`flex items-center p-2 rounded hover:bg-gray-200 transition-colors ${
                pathname === link.href ? "bg-gray-300 font-semibold" : ""
              }`}
            >
              <span className="mr-3 text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
