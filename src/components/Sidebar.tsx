
'use client';

import { useEffect, useState, useMemo } from 'react';
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
  ChevronDown,
  Settings,
  CheckCircle,
  Shield,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Receipt,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import clsx from 'clsx';
import useAuthGuard from '@/hooks/useAuthGuard';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
  user?: { name: string; role: string; businessName?: string; phoneNumber?: string } | null; // Added phoneNumber
  businesses?: string[]; // ✅ Team/Business switcher
}

const navLinks = [
  { href: '/dashboard/home', label: 'Dashboard', icon: Home, section: 'GENERAL', permission: 'dashboard' },
  { href: '/dashboard/parties', label: 'Parties', icon: Users, section: 'GENERAL', permission: 'parties' },
  { href: '/dashboard/product/NewProduct', label: 'Products', icon: Package, section: 'GENERAL', permission: 'products' },
  {
    label: 'Sales', icon: TrendingUp, section: 'SALES', permission: 'sales', children: [
      { href: '/dashboard/sale/sales-data', label: 'Sales Invoices' },
      { href: '/dashboard/return/sale/sales-return-data', label: 'Sales Return', permission: 'salesReturn' },
    ]
  },
  {
    label: 'Purchases', icon: ShoppingCart, section: 'PURCHASES', permission: 'purchases', children: [
      { href: '/dashboard/purchase/purchase-data', label: 'Purchase Invoices' },
      { href: '/dashboard/return/purchase/purchase-return-data', label: 'Purchase Return', permission: 'purchasesReturn' }
    ]
  },
  { href: '/dashboard/cashbook', label: 'Cashbook', icon: CreditCard, section: 'GENERAL', permission: 'cashbook' },
  { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt, section: 'GENERAL', permission: 'expenses' },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart, section: 'GENERAL', permission: 'reports' },
  { href: '/dashboard/staff', label: 'Staff', icon: UserCog, section: 'GENERAL', permission: 'staff' },
];

export default function Sidebar({ businesses = [] }: SidebarProps) {
  const { user, loading } = useAuthGuard();
  const pathname = usePathname() || '';
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [dark, setDark] = useState(false); // Kept for potential future use
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) router.push('/');
      else alert("Logout failed");
    } catch {
      alert("Something went wrong");
    } finally {
      setLogoutLoading(false);
    }
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  };

  // persist collapse state
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    } catch (e) {
      // ignore
    }
  }, [isCollapsed]);

  // Memoize filtered and grouped nav links based on user permissions
  const sections = useMemo(() => {
    const filteredLinks = navLinks.filter(link => {
      // Only show the 'Staff' link if the user is NOT a staff member.
      if (link.permission === 'staff') {
        return user?.role !== 'staff';
      }
      return true; // Show all other links
    });

    // Group filtered links by section
    return filteredLinks.reduce((acc, link) => {
      const section = link.section || 'OTHER';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(link);
      return acc;
    }, {} as { [key: string]: typeof navLinks });

  }, [user?.permissions]);

  return (
    <>
    <aside
      className={clsx(
        'relative h-screen bg-[#35053C] text-white flex flex-col transition-all duration-300 shadow-xl',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header (User Info & Settings) */}
      <div className={clsx(
        'flex items-center px-4 py-3 border-b border-gray-700/50',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-2">
          {/* Avatar Placeholder or Skeleton */}
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-sm font-semibold">
              {user?.businessName ? user.businessName[0] : user?.name ? user.name[0] : 'U'}
            </div>
          )}

          {!isCollapsed && (
            loading ? (
              <div className="flex flex-col w-40">
                <Skeleton className="h-4 w-32 mb-2 rounded" />
                <Skeleton className="h-3 w-28 mb-1 rounded" />
                <Skeleton className="h-3 w-24 mb-1 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            ) : user ? (
              <div className="flex flex-col w-40">
                <span className="text-sm font-semibold truncate" title={user.businessName || user.name}>
                  {user.businessName || user.name || "User"}
                </span>
                <span className="text-xs text-gray-400 truncate" title={user.name}>
                  {user.phone}
                </span>
                <span className="text-xs text-gray-400 truncate" title={user.phone}>
                  {user.name}
                </span>
                <span className="text-xs text-gray-400 truncate capitalize" title={user.role}>
                  {user.role}
                </span>
              </div>
            ) : null
          )}
        </div>
        {/* Top settings: hide when sidebar is collapsed */}
        {!isCollapsed && (
          <Link href={"/dashboard/settings/company"}> 
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </Link>
        )}
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm custom-scrollbar">
        {Object.keys(sections).map((sectionTitle) => (
          <div key={sectionTitle} className="mb-4">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">
                {sectionTitle}
              </h2>
            )}
            <ul className="space-y-1">
              {sections[sectionTitle].map((link) => {
                const isDropdown = !!link.children;

                if (isDropdown) {
                  const isOpen = openDropdowns.includes(link.label) || link.children.some(child => pathname.startsWith(child.href));
                  return (
                    <li key={link.label}>
                      <button
                        onClick={() => toggleDropdown(link.label)}
                        title={isCollapsed ? link.label : undefined}
                        className={clsx(
                          'flex items-center justify-between w-full px-3 py-2 rounded-md',
                          'text-gray-300 hover:bg-gray-700 hover:text-white transition-colors',
                          isOpen && 'bg-gray-700 text-white',
                          isCollapsed && 'justify-center'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon className="w-5 h-5" />
                          {!isCollapsed && link.label}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
                          />
                        )}
                      </button>
                      {isOpen && !isCollapsed && (
                        <div className="ml-5 mt-1 space-y-1 bg-[#2c3e50] rounded-md py-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={clsx(
                                'block px-5 py-1.5 rounded-md transition text-gray-300',
                                pathname.startsWith(child.href)
                                  ? 'bg-[#34495e] text-white font-medium'
                                  : 'hover:bg-[#3e5369] hover:text-white'
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      title={isCollapsed ? link.label : undefined}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition',
                        pathname.startsWith(link.href) ? 'bg-[#34495e] text-white font-medium' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        isCollapsed && 'justify-center'
                      )}
                    >
                      <link.icon className="w-5 h-5" />
                      {!isCollapsed && link.label}
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
        {/* Collapse/Expand button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            'hidden md:flex items-center gap-2 w-full px-3 py-2 rounded-md transition text-gray-300 hover:bg-gray-700 hover:text-white',
            isCollapsed && 'justify-center'
          )}
        >
          {isCollapsed ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          {!isCollapsed && "Collapse"}
        </button>

         {/* Settings Link */}
              <Link href="/dashboard/settings/company" title={isCollapsed ? 'Settings' : undefined} className={clsx(
              'flex items-center gap-2 w-full px-3 py-2 rounded-md transition',
              pathname.startsWith('/dashboard/settings') // Active if any setting page
                ? 'bg-[#34495e] text-white font-medium'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              isCollapsed && 'justify-center'
            )}>
          <Settings className="w-5 h-5" />
          {!isCollapsed && "Settings"}
        </Link>

        {/* Badges */}
        {!isCollapsed && (
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
          disabled={logoutLoading}
          className={clsx(
            'flex items-center gap-2 w-full px-3 py-2 mt-2 rounded-md text-red-400 font-medium hover:bg-red-900/30 transition-colors disabled:opacity-50',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" /> {!isCollapsed && (logoutLoading ? "Logging out..." : "Logout")}
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
    </>
  );
}