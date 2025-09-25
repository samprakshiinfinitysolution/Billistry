


// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   Home,
//   Users,
//   Package,
//   FileText,
//   CreditCard,
//   BarChart,
//   LogOut,
//   Menu,
//   X,
// } from 'lucide-react';
// import clsx from 'clsx';
// import { useState } from 'react';

// interface SidebarProps {
//   user?: { name: string; role: string; businessName?: string } | null;
// }

// // Navigation Links
// const navLinks = [
//   { href: '/dashboard/home', label: 'Home', icon: <Home className="w-5 h-5" /> },
//   { href: '/dashboard/customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
//   { href: '/dashboard/suppliers', label: 'Suppliers', icon: <Users className="w-5 h-5" /> },
//   { href: '/dashboard/cashbook', label: 'Cashbook', icon: <CreditCard className="w-5 h-5" /> },
//   { href: '/dashboard/product', label: 'Product', icon: <Package className="w-5 h-5" /> },
//   { href: '/dashboard/sale', label: 'Sale', icon: <FileText className="w-5 h-5" /> },
//   { href: '/dashboard/return/sale', label: 'Return Sale', icon: <FileText className="w-5 h-5" /> },

//   { href: '/dashboard/purchase', label: 'Purchase', icon: <FileText className="w-5 h-5" /> },
//    { href: '/dashboard/return/purchase', label: 'Return Purchase', icon: <FileText className="w-5 h-5" /> },
//   { href: '/dashboard/expenses', label: 'Expenses', icon: <FileText className="w-5 h-5" /> },
//   { 
//     href: '/dashboard/staff', 
//     label: 'Staff', 
//     icon: <Users className="w-5 h-5" />, 
//     roles: ['superadmin', 'shopkeeper'] // ✅ Restrict staff tab visibility
//   },
//   { href: '/dashboard/reports', label: 'Reports', icon: <BarChart className="w-5 h-5" /> },
// ];

// export default function Sidebar({ user }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   const handleLogout = async () => {
//     if (loading) return;
//     setLoading(true);
//     try {
//       const res = await fetch('/api/auth/logout', { method: 'POST' });
//       const data = await res.json();
//       if (res.ok) router.push('/');
//       else alert(data.error || 'Logout failed');
//     } catch (err) {
//       console.error(err);
//       alert('Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <aside
//       className={clsx(
//         'h-screen bg-white border-r shadow-sm flex flex-col transition-all duration-300',
//         collapsed ? 'w-20' : 'w-64'
//       )}
//     >
//       {/* Top Bar */}
//       <div className="flex items-center justify-between px-4 py-4 border-b">
//         <h1
//           className={clsx(
//             'text-2xl font-bold text-green-600 truncate',
//             collapsed && 'hidden'
//           )}
//         >
//           Billistry
//         </h1>
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="p-1 rounded hover:bg-gray-100"
//         >
//           {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
//         </button>
//       </div>

//       {/* User Info */}
//       {user && !collapsed && (
//         <div className="px-4 py-3 border-b text-sm text-gray-700">
//           <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
//             Account Details
//           </h3>
//           <div className="space-y-1">
//             <p>
//               <span className="font-semibold text-gray-600">Role:</span>{' '}
//               <span className="capitalize">{user.role ?? '—'}</span>
//             </p>
//             <p>
//               <span className="font-semibold text-gray-600">Name:</span>{' '}
//               {user.name ?? 'User'}
//             </p>
//             {user.businessName && (
//               <p>
//                 <span className="font-semibold text-gray-600">Shop:</span>{' '}
//                 {user.businessName}
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
//         {navLinks
//           .filter(
//             (link) => !link.roles || link.roles.includes(user?.role || '')
//           ) // ✅ filter by role
//           .map(({ href, label, icon }) => (
//             <Link
//               key={href}
//               href={href}
//               className={clsx(
//                 'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-100 transition',
//                 pathname === href
//                   ? 'bg-green-50 text-green-700 font-medium'
//                   : 'text-gray-700',
//                 collapsed && 'justify-center'
//               )}
//             >
//               {icon}
//               {!collapsed && label}
//             </Link>
//           ))}

//         {/* Logout Button */}
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className={clsx(
//             'flex items-center gap-3 px-3 py-2 mt-4 rounded-md hover:bg-red-100 text-red-600 font-medium transition disabled:opacity-50',
//             collapsed && 'justify-center'
//           )}
//         >
//           <LogOut className="w-5 h-5" />
//           {!collapsed && (loading ? 'Logging out...' : 'Logout')}
//         </button>
//       </nav>
//     </aside>
//   );
// }




'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Users, Package, FileText, CreditCard, BarChart,
  LogOut, Menu, Bell, Sun, Moon, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface SidebarProps {
  user?: { name: string; role: string; businessName?: string } | null;
  businesses?: string[]; // ✅ Team/Business switcher
}

const navLinks = [
  { href: '/dashboard/home', label: 'Home', icon: Home },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: Users },
  { href: '/dashboard/product', label: 'Product', icon:Users },
  
  { 
    label: 'Sales', icon: FileText, children: [
      { href: '/dashboard/sale', label: 'Sale' },
      { href: '/dashboard/return/sale', label: 'Return Sale' }
    ]
  },
  {
    label: 'Purchases', icon: Package, children: [
      { href: '/dashboard/purchase', label: 'Purchase' },
      { href: '/dashboard/return/purchase', label: 'Return Purchase' }
    ]
  },
  
  { href: '/dashboard/cashbook', label: 'Cashbook', icon: CreditCard },
  { href: '/dashboard/expenses', label: 'Expenses', icon: FileText },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart },
  { href: '/dashboard/staff', label: 'Staff', icon: Users, roles: ['superadmin', 'shopkeeper'] },
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

  return (
    <aside
      className={clsx(
        'h-screen bg-white dark:bg-gray-900 border-r shadow-lg flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {!collapsed && (
          <h1 className="text-xl font-bold text-green-600 truncate">Billistry</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* User Info + Business Switcher */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-b text-sm text-gray-700 dark:text-gray-200">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
          {businesses.length > 1 && (
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="mt-2 w-full p-2 rounded-md border dark:bg-gray-800"
            >
              {businesses.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
        {navLinks
          .filter((link) => !link.roles || link.roles.includes(user?.role || ''))
          .map((link) => {
            const isActive = pathname === link.href;
            const isDropdown = !!link.children;

            if (isDropdown) {
              const isOpen = openDropdowns.includes(link.label);
              return (
                <div key={link.label}>
                  <button
                    onClick={() => toggleDropdown(link.label)}
                    className={clsx(
                      'flex items-center justify-between w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
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
                    <div className="ml-8 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={clsx(
                            'block px-3 py-1.5 rounded-md transition',
                            pathname === child.href
                              ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition',
                  isActive
                    ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  collapsed && 'justify-center'
                )}
              >
                <link.icon className="w-5 h-5" />
                {!collapsed && link.label}
              </Link>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t space-y-2">
        {/* Notifications */}
        <div className="relative">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell className="w-5 h-5" /> {!collapsed && "Notifications"}
          </button>
          {!collapsed && notifications.length > 0 && (
            <div className="absolute bottom-12 left-3 bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 w-64">
              {notifications.map((n, i) => (
                <p key={i} className="text-xs text-gray-700 dark:text-gray-300">{n}</p>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && (dark ? "Light Mode" : "Dark Mode")}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 w-full px-3 py-2 mt-2 rounded-md text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" /> {!collapsed && (loading ? "Logging out..." : "Logout")}
        </button>
      </div>
    </aside>
  );
}
