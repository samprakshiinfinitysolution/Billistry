
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Users, Package, FileText, CreditCard, BarChart,
  LogOut, Menu, Bell, Sun, Moon, ChevronDown, Plus, Crown, Settings, CheckCircle, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface SidebarProps {
  user?: { name: string; role: string; businessName?: string; phoneNumber?: string } | null; // Added phoneNumber
  businesses?: string[]; // ✅ Team/Business switcher
}

const navLinks = [
  { href: '/dashboard/home', label: 'Dashboard', icon: Home, section: 'GENERAL' }, // Changed Home to Dashboard
  { href: '/dashboard/parties', label: 'Parties', icon: Users, section: 'GENERAL' }, // Renamed Customers to Parties
  // {
  //   label: 'Parties', icon: Users, section: 'PARTIES', children: [ // New Section
      
  //     { href: '/dashboard/customers', label: 'Customers' },
  //     { href: '/dashboard/suppliers', label: 'Suppliers' }
  //   ]
  // },

  { href: '/dashboard/product/NewProduct', label: 'Products', icon: Package, section: 'GENERAL' }, // Renamed Product to Items, changed icon

  {
    label: 'Sales', icon: FileText, section: 'SALES', children: [
      { href: '/dashboard/sale/sales-data', label: 'Sales Invoices' },
      // { href: '/dashboard/quotation-estimate', label: 'Quotation / Estimate' }, // Added
      // { href: '/dashboard/payment-in', label: 'Payment In' }, // Added
      { href: '/dashboard/return/sale/sales-return-data', label: 'Sales Return' }, // Renamed Sale Return
      // { href: '/dashboard/credit-note', label: 'Credit Note' }, // Added
      // { href: '/dashboard/delivery-challan', label: 'Delivery Challan' }, // Added
      // { href: '/dashboard/proforma-invoice', label: 'Proforma Invoice' } // Added
    ]
  },
  {
    label: 'Purchases', icon: Package, section: 'PURCHASES', children: [ // New Section
      // { href: '/dashboard/purchase', label: 'Purchase' },
      { href: '/dashboard/purchase/purchase-data', label: 'Purchase Invoices' },
      { href: '/dashboard/return/purchase/purchase-return-data', label: 'Purchase Return' }
    ]
  },
  { href: '/dashboard/cashbook', label: 'Cashbook', icon: CreditCard, section: 'GENERAL' }, // Moved to GENERAL
  { href: '/dashboard/expenses', label: 'Expenses', icon: FileText, section: 'GENERAL' }, // Moved to GENERAL
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart, section: 'GENERAL' }, // Moved to GENERAL
  { href: '/dashboard/staff', label: 'Staff', icon: Users, roles: ['superadmin', 'shopkeeper'], section: 'GENERAL' },
];

export default function Sidebar({ user, businesses = [] }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState(businesses[0] || "");
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  // Apply dark theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) router.push('/');
      else alert("Logout failed");
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  };

  // Group navLinks by section
  const sections: { [key: string]: typeof navLinks } = navLinks.reduce((acc, link) => {
    const section = link.section || 'OTHER'; // Default section if none specified
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(link);
    return acc;
  }, {} as { [key: string]: typeof navLinks });

  return (
    <aside
      className={clsx(
        'h-screen bg-[#35053C] text-white flex flex-col transition-all duration-300 shadow-xl',
        collapsed ? 'w-20' : 'w-52'
      )}
    >
      {/* Header (User Info & Settings) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          {/* Avatar Placeholder */}
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-semibold">
            {user?.businessName ? user.businessName[0] : user?.name ? user.name[0] : 'U'}
          </div>
          {!collapsed && (
            // <div className="flex flex-col ">
            //   <span className="text-sm font-semibold truncate">
            //     {user?.businessName || user?.name || 'User'}
            //   </span>
            //   <span className="text-xs text-gray-400">
            //     {user?.phoneNumber || '9340806947'}
            //   </span>
            //   <span className="text-xs text-gray-400">
            //     {user?.role || 'User'}
            //   </span>
            // </div>


            <div className="flex flex-col w-28"> {/* 👈 give a width */}
  <span className="text-sm font-semibold truncate">
    {user?.businessName || user?.name || "User"}
  </span>
  <span className="text-xs text-gray-400 truncate">
    {user?.phoneNumber || "9340806947"}
  </span>
  <span className="text-xs text-gray-400 truncate">
    {user?.role || "User"}
  </span>
</div>

          )}
        </div>
        <Link href={"/dashboard/settings/company"}> 
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        </Link>
      </div>

      {/* Create Sales Invoice Button */}
      {/* <div className="px-4 py-3 border-b border-gray-700/50">
        <button className="flex items-center justify-center w-full bg-[#34495e] hover:bg-[#4a637d] transition-colors text-white py-2 rounded-md">
          <Plus className="w-4 h-4 mr-2" />
          {!collapsed && 'Create Sales Invoice'}
          {!collapsed && <ChevronDown className="w-4 h-4 ml-auto" />}
        </button>
      </div> */}

      {/* Buy Premium Plan */}
      {/* {!collapsed && (
        <div className="px-4 py-2 bg-[#d68a35] text-white flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" /> Buy Premium Plan
          </div>
          <span className="bg-[#a06821] text-xs px-2 py-0.5 rounded">8 Days Left</span>
        </div>
      )} */}


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm custom-scrollbar">
        {Object.keys(sections).map((sectionTitle) => (
          <div key={sectionTitle} className="mb-4">
            {!collapsed && (
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">
                {sectionTitle}
              </h2>
            )}
            <ul className="space-y-1">
              {sections[sectionTitle]
                .filter((link) => !link.roles || link.roles.includes(user?.role || ''))
                .map((link) => {
                  const isActive = pathname === link.href;
                  const isDropdown = !!link.children;

                  if (isDropdown) {
                    const isOpen = openDropdowns.includes(link.label) ||
                                   link.children.some(child => pathname.startsWith(child.href)); // Keep open if child is active
                    return (
                      <li key={link.label}>
                        <button
                          onClick={() => toggleDropdown(link.label)}
                          className={clsx(
                            'flex items-center justify-between w-full px-3 py-2 rounded-md',
                            'text-gray-300 hover:bg-gray-700 hover:text-white transition-colors',
                            (isOpen || link.children.some(child => pathname.startsWith(child.href))) && 'bg-gray-700 text-white',
                            collapsed && 'justify-center'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <link.icon className="w-5 h-5" />
                            {!collapsed && link.label}
                          </div>
                          {!collapsed && (
                            <ChevronDown
                              className={clsx(
                                'w-4 h-4 transition-transform',
                                isOpen && 'rotate-180'
                              )}
                            />
                          )}
                        </button>
                        {isOpen && !collapsed && (
                          <div className="ml-5 mt-1 space-y-1 bg-[#2c3e50] rounded-md py-1"> {/* Indented and styled dropdown */}
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={clsx(
                                  'block px-5 py-1.5 rounded-md transition text-gray-300',
                                  pathname.startsWith(child.href) // Use startsWith for broader active state
                                    ? 'bg-[#34495e] text-white font-medium'
                                    : 'hover:bg-[#3e5369] hover:text-white'
                                )}
                              >
                                {child.label}
                              </Link>
                            ))}
                            {/* "Scroll for more options" for Sales dropdown */}
                            {/* {link.label === 'Sales' && (
                              <div className="text-center mt-2 pb-1">
                                <span className="text-xs text-gray-400">
                                  Scroll for more options <ChevronDown className="inline w-3 h-3 ml-1" />
                                </span>
                              </div>
                            )} */}
                          </div>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-md transition',
                          pathname.startsWith(link.href) // Use startsWith for broader active state
                            ? 'bg-[#34495e] text-white font-medium' // Active background
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          collapsed && 'justify-center'
                        )}
                      >
                        <link.icon className="w-5 h-5" />
                        {!collapsed && link.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700/50 space-y-2">
         {/* Settings Link */}
         <Link href="/dashboard/settings/company" className={clsx(
              'flex items-center gap-2 w-full px-3 py-2 rounded-md transition',
              pathname.startsWith('/dashboard/settings') // Active if any setting page
                ? 'bg-[#34495e] text-white font-medium'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              collapsed && 'justify-center'
            )}>
          <Settings className="w-5 h-5" />
          {!collapsed && "Settings"}
        </Link>


        {/* Dark Mode Toggle - Simplified for space */}
        {/* {!collapsed && (
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        )} */}

        {/* Notifications - Removed for brevity, or place it strategically */}
        {/* <div className="relative"> ... </div> */}

        {/* Badges */}
        {!collapsed && (
          <div className="flex items-center justify-around text-xs text-gray-400 mt-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" /> 100% Secure
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" /> ISO Certified
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className={clsx(
            'flex items-center gap-2 w-full px-3 py-2 mt-2 rounded-md text-red-400 font-medium hover:bg-red-900/30 transition-colors disabled:opacity-50',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" /> {!collapsed && (loading ? "Logging out..." : "Logout")}
        </button>
      </div>
      <style jsx>{`
        /* Custom Scrollbar for better appearance */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2c3e50; /* Darker track */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a637d; /* Lighter thumb */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5d7490;
        }
      `}</style>
    </aside>
  );
}