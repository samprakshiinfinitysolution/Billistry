


// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   Home,
//   Users,
//   Package,
//   FileText,
//   CreditCard,
//   BarChart,
//   Settings,
//   HelpCircle,
//   User,
//   LogOut,
// } from 'lucide-react';
// import clsx from 'clsx';

// const navLinks = [
//   { href: '/dashboard/home', label: 'Home', icon: <Home className="w-4 h-4" /> },
//   { href: '/dashboard/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
//   { href: '/dashboard/suppliers', label: 'Suppliers', icon: <Users className="w-4 h-4" /> },
//   { href: '/dashboard/cashbook', label: 'Cashbook', icon: <CreditCard className="w-4 h-4" /> },

//   // reports-parties
//   { href: '/dashboard/reports-parties', label: 'Reports-Parties', icon: <Users className="w-4 h-4" /> },

//   // staff
  
//   { href: '/dashboard/items', label: 'Items', icon: <Package className="w-4 h-4" /> },
//   { href: '/dashboard/invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/sale', label: 'Sale', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/purchase', label: 'Purchase', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/expenses', label: 'Expenses', icon: <FileText className="w-4 h-4" /> },

//   { href: '/dashboard/transactions', label: 'Transactions', icon: <CreditCard className="w-4 h-4" /> },
//   { href: '/dashboard/reports', label: 'Reports', icon: <BarChart className="w-4 h-4" /> },
//   { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
//   { href: '/dashboard/help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
//   { href: '/dashboard/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
//   { href: '/dashboard/logout', label: 'Logout', icon: <LogOut className="w-4 h-4" /> },
// ];
// export default function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col">
//       <div className="px-6 py-5 border-b">
//         <h1 className="text-2xl font-bold text-green-600">Billistry</h1>
//       </div>
//       <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 text-sm">
//         {navLinks.map(({ href, label, icon }) => (
//           <Link
//             key={href}
//             href={href}
//             className={clsx(
//               'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-green-100 transition',
//               pathname === href ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
//             )}
//           >
//             {icon}
//             {label}
//           </Link>
//         ))}
//       </nav>
//     </aside>
//   );
// }


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
//   Settings,
//   HelpCircle,
//   User,
//   LogOut,
// } from 'lucide-react';
// import clsx from 'clsx';
// import { useState } from 'react';

// const navLinks = [
//   { href: '/dashboard/home', label: 'Home', icon: <Home className="w-4 h-4" /> },
//   { href: '/dashboard/customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
//   { href: '/dashboard/suppliers', label: 'Suppliers', icon: <Users className="w-4 h-4" /> },
//   { href: '/dashboard/cashbook', label: 'Cashbook', icon: <CreditCard className="w-4 h-4" /> },
//   { href: '/dashboard/reports-parties', label: 'Reports-Parties', icon: <Users className="w-4 h-4" /> },
//   { href: '/dashboard/items', label: 'Items', icon: <Package className="w-4 h-4" /> },
//   { href: '/dashboard/invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/sale', label: 'Sale', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/purchase', label: 'Purchase', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/expenses', label: 'Expenses', icon: <FileText className="w-4 h-4" /> },
//   { href: '/dashboard/transactions', label: 'Transactions', icon: <CreditCard className="w-4 h-4" /> },
//   { href: '/dashboard/reports', label: 'Reports', icon: <BarChart className="w-4 h-4" /> },
//   { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
//   { href: '/dashboard/help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
//   { href: '/dashboard/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const handleLogout = async () => {
//   if (loading) return;
//   setLoading(true);
//   try {
//     const res = await fetch('/api/auth/logout', { method: 'POST' });
//     const data = await res.json();
//     if (res.ok) {
//       router.push('/'); // redirect to home or login page
//     } else {
//       alert(data.error || 'Failed to logout');
//     }
//   } catch (err) {
//     console.error(err);
//     alert('Something went wrong');
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col">
//       <div className="px-6 py-5 border-b">
//         <h1 className="text-2xl font-bold text-green-600">Billistry</h1>
//       </div>
//       <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 text-sm">
//         {navLinks.map(({ href, label, icon }) => (
//           <Link
//             key={href}
//             href={href}
//             className={clsx(
//               'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-green-100 transition',
//               pathname === href ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
//             )}
//           >
//             {icon}
//             {label}
//           </Link>
//         ))}

//         {/* Logout button */}
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className="flex items-center gap-3 px-4 py-2 w-full rounded-md hover:bg-red-100 text-red-600 font-medium transition disabled:opacity-50"
//         >
//           <LogOut className="w-4 h-4" />
//           {loading ? 'Logging out...' : 'Logout'}
//         </button>
//       </nav>
//     </aside>
//   );
// }



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
//   Settings,
//   HelpCircle,
//   User,
//   LogOut,
//   Menu,
//   X,
// } from 'lucide-react';
// import clsx from 'clsx';
// import { useState } from 'react';

// interface SidebarProps {
//   user?: { name: string; role: string } | null;
// }

// const navLinks = [
//   { href: '/dashboard/home', label: 'Home', icon: <Home className="w-5 h-5" /> },
//   { href: '/dashboard/customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
//   { href: '/dashboard/suppliers', label: 'Suppliers', icon: <Users className="w-5 h-5" /> },
//   { href: '/dashboard/cashbook', label: 'Cashbook', icon: <CreditCard className="w-5 h-5" /> },
//   // { href: '/dashboard/reports-parties', label: 'Reports-Parties', icon: <Users className="w-5 h-5" /> },
//   // { href: '/dashboard/items', label: 'Items', icon: <Package className="w-5 h-5" /> },
//   { href: '/dashboard/product', label: 'Product', icon: <Package className="w-5 h-5" /> },
//   // { href: '/dashboard/invoices', label: 'Invoices', icon: <FileText className="w-5 h-5" /> },
//   { href: '/dashboard/sale', label: 'Sale', icon: <FileText className="w-5 h-5" /> },
//   { href: '/dashboard/purchase', label: 'Purchase', icon: <FileText className="w-5 h-5" /> },
//   { href: '/dashboard/expenses', label: 'Expenses', icon: <FileText className="w-5 h-5" /> },
//   // { href: '/dashboard/transactions', label: 'Transactions', icon: <CreditCard className="w-5 h-5" /> },
//   //staff
//   { href: '/dashboard/staff', label: 'Staff', icon: <Users className="w-5 h-5" /> },
//   { href: '/dashboard/reports', label: 'Reports', icon: <BarChart className="w-5 h-5" /> },
//   // { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
//   // { href: '/dashboard/help', label: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
//   // { href: '/dashboard/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
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
//     <aside className={clsx(
//       "h-screen bg-white border-r shadow-sm flex flex-col transition-all duration-300",
//       collapsed ? "w-20" : "w-64"
//     )}>
//       {/* Top Bar */}
//       <div className="flex items-center justify-between px-4 py-4 border-b">
//         <h1 className={clsx("text-2xl font-bold text-green-600 truncate", collapsed && "hidden")}>
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
//       {/* {user && !collapsed && (
//         <div className="px-4 py-3 border-b text-sm text-gray-600">
//           Hello, <span className="font-medium">{user.name}</span>
//           <p>{user.role}</p>
//         </div>
//       )} */}

//     {/* User Info */}
// {user && !collapsed && (
//   <div className="px-4 py-3 border-b text-sm text-gray-700">
//     <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
//       Account Details
//     </h3>
//     <div className="space-y-1">
//       <p>
//         <span className="font-semibold text-gray-600">Role:</span>{" "}
//         <span className="capitalize">{user.role ?? "—"}</span>
//       </p>
//       <p>
//         <span className="font-semibold text-gray-600">Name:</span>{" "}
//         {user.name ?? "User"}
//       </p>
//       {user.businessName && (
//         <p>
//           <span className="font-semibold text-gray-600">Shop:</span>{" "}
//           {user.businessName}
//         </p>
//       )}
//     </div>
//   </div>
// )}




//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
//         {navLinks.map(({ href, label, icon }) => (
//           <Link
//             key={href}
//             href={href}
//             className={clsx(
//               "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-100 transition",
//               pathname === href
//                 ? "bg-green-50 text-green-700 font-medium"
//                 : "text-gray-700",
//               collapsed && "justify-center"
//             )}
//           >
//             {icon}
//             {!collapsed && label}
//           </Link>
//         ))}

//         {/* Logout Button */}
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className={clsx(
//             "flex items-center gap-3 px-3 py-2 mt-4 rounded-md hover:bg-red-100 text-red-600 font-medium transition disabled:opacity-50",
//             collapsed && "justify-center"
//           )}
//         >
//           <LogOut className="w-5 h-5" />
//           {!collapsed && (loading ? "Logging out..." : "Logout")}
//         </button>
//       </nav>
//     </aside>
//   );
// }





'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Package,
  FileText,
  CreditCard,
  BarChart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface SidebarProps {
  user?: { name: string; role: string; businessName?: string } | null;
}

// Navigation Links
const navLinks = [
  { href: '/dashboard/home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { href: '/dashboard/customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: <Users className="w-5 h-5" /> },
  { href: '/dashboard/cashbook', label: 'Cashbook', icon: <CreditCard className="w-5 h-5" /> },
  { href: '/dashboard/product', label: 'Product', icon: <Package className="w-5 h-5" /> },
  { href: '/dashboard/sale', label: 'Sale', icon: <FileText className="w-5 h-5" /> },
  { href: '/dashboard/purchase', label: 'Purchase', icon: <FileText className="w-5 h-5" /> },
  { href: '/dashboard/expenses', label: 'Expenses', icon: <FileText className="w-5 h-5" /> },
  { 
    href: '/dashboard/staff', 
    label: 'Staff', 
    icon: <Users className="w-5 h-5" />, 
    roles: ['superadmin', 'shopkeeper'] // ✅ Restrict staff tab visibility
  },
  { href: '/dashboard/reports', label: 'Reports', icon: <BarChart className="w-5 h-5" /> },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (res.ok) router.push('/');
      else alert(data.error || 'Logout failed');
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      className={clsx(
        'h-screen bg-white border-r shadow-sm flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <h1
          className={clsx(
            'text-2xl font-bold text-green-600 truncate',
            collapsed && 'hidden'
          )}
        >
          Billistry
        </h1>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* User Info */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-b text-sm text-gray-700">
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
            Account Details
          </h3>
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-gray-600">Role:</span>{' '}
              <span className="capitalize">{user.role ?? '—'}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-600">Name:</span>{' '}
              {user.name ?? 'User'}
            </p>
            {user.businessName && (
              <p>
                <span className="font-semibold text-gray-600">Shop:</span>{' '}
                {user.businessName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 text-sm">
        {navLinks
          .filter(
            (link) => !link.roles || link.roles.includes(user?.role || '')
          ) // ✅ filter by role
          .map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-100 transition',
                pathname === href
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700',
                collapsed && 'justify-center'
              )}
            >
              {icon}
              {!collapsed && label}
            </Link>
          ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 mt-4 rounded-md hover:bg-red-100 text-red-600 font-medium transition disabled:opacity-50',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && (loading ? 'Logging out...' : 'Logout')}
        </button>
      </nav>
    </aside>
  );
}
