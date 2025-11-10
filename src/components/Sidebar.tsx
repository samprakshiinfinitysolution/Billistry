
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
  
  ShoppingCart,
  Receipt,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import clsx from 'clsx';
import useAuthGuard from '@/hooks/useAuthGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback } from 'react';

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
      { href: '/dashboard/sale/payment-in', label: 'Payment In' },
    ]
  },
  {
    label: 'Purchases', icon: ShoppingCart, section: 'PURCHASES', permission: 'purchases', children: [
      { href: '/dashboard/purchase/purchase-data', label: 'Purchase Invoices' },
      { href: '/dashboard/return/purchase/purchase-return-data', label: 'Purchase Return', permission: 'purchasesReturn' },
      { href: '/dashboard/purchase/payment-out', label: 'Payment Out' }
    ]
  },
  { href: '/dashboard/cashbook', label: 'Cashbook', icon: CreditCard, section: 'GENERAL', permission: 'cashbook' },
  { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt, section: 'GENERAL', permission: 'expenses' },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart, section: 'GENERAL', permission: 'reports' },
  { href: '/dashboard/staff', label: 'Staff', icon: UserCog, section: 'GENERAL', permission: 'staff' },
  { href: '/dashboard/e-invoicing', label: 'E-Invoicing', icon: FileText, section: 'ACCOUNTING', permission: 'eInvoicing' },
  { href: '/dashboard/automated-bills', label: 'Automated Bills', icon: Receipt, section: 'ACCOUNTING', permission: 'automatedBills' },
];

export default function Sidebar({ businesses = [] }: SidebarProps) {
  const { user, loading } = useAuthGuard();
  const pathname = usePathname() || '';
  const router = useRouter();

  // Sidebar collapsed state (persisted)
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

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

  // fetch business settings to get logo url (client-side)
  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch('/api/business/settings');
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.success && json.data && json.data.logoUrl) {
        setLogoUrl(json.data.logoUrl);
      }
    } catch (e) {
      // ignore, leave logoUrl as null
    }
  }, []);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  // Build ordered sections: GENERAL (Dashboard, Parties, Products, Sales, Purchases)
  // then ACCOUNTING SOLUTIONS (everything else). Respect simple permission filter.
  const sectionsList = useMemo(() => {
    const filteredLinks = navLinks.filter(link => {
      if (link.permission === 'staff') return user?.role !== 'staff';
      return true;
    });

  const generalOrderLabels = new Set(['Dashboard', 'Parties', 'Products', 'Sales', 'Purchases', 'Reports']);

    const general: typeof navLinks = [];
    const accounting: typeof navLinks = [];

    for (const link of filteredLinks) {
      if (generalOrderLabels.has(link.label)) {
        general.push(link);
      } else {
        accounting.push(link);
      }
    }

    // Keep the requested order for GENERAL: Dashboard, Parties, Products, Sales, Purchases
    const orderedGeneral = [
      ...general.filter(l => l.label === 'Dashboard'),
      ...general.filter(l => l.label === 'Parties'),
      ...general.filter(l => l.label === 'Products'),
      ...general.filter(l => l.label === 'Sales'),
      ...general.filter(l => l.label === 'Purchases'),
      ...general.filter(l => l.label === 'Reports'),
    ].filter(Boolean);

    return [
      { title: 'GENERAL', links: orderedGeneral },
      { title: 'ACCOUNTING SOLUTIONS', links: accounting },
    ];
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
      <div
        className={clsx(
          'border-b border-gray-700/50',
          isCollapsed ? 'flex flex-col items-center px-2 py-3' : 'flex items-center px-4 py-3 justify-between'
        )}
      >
        {isCollapsed ? (
          // Collapsed header: small avatar stacked with menu button
          <div className="flex flex-col items-center gap-2">
            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : (
              logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-contain bg-white p-1" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-semibold">
                  {user?.businessName ? user.businessName[0] : user?.name ? user.name[0] : 'U'}
                </div>
              )
            )}
            <button
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setIsCollapsed((s) => !s)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        ) : (
          // Expanded header: avatar + details on left, menu on right
          <>
            <div className="flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : (
                logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white p-1" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-sm font-semibold">
                    {user?.businessName ? user.businessName[0] : user?.name ? user.name[0] : 'U'}
                  </div>
                )
              )}

              {loading ? (
                <div className="flex flex-col w-40">
                  <Skeleton className="h-4 w-32 mb-2 rounded" />
                  <Skeleton className="h-3 w-28 mb-1 rounded" />
                  <Skeleton className="h-3 w-24 mb-1 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ) : user ? (
                <div className="flex flex-col w-40">
                  <span className="text-sm font-semibold truncate" title={user.businessName || user.name}>
                    {user.businessName || user.name || 'User'}
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
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setIsCollapsed((s) => !s)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm custom-scrollbar">
        {sectionsList.map(({ title, links }) => (
          <div key={title} className="mb-4">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">
                {title}
              </h2>
            )}
            <ul className="space-y-1">
              {links.map((link: any) => {
                const isDropdown = !!link.children;

                if (isDropdown) {
                  const isOpen = openDropdowns.includes(link.label) || link.children.some((child: any) => pathname.startsWith(child.href));
                  return (
                    <li key={link.label}>
                      <button
                              onClick={(e) => {
                          // If the parent has children, navigate to the first child's page
                          if (link.children && link.children[0] && link.children[0].href) {
                            try {
                              router.push(link.children[0].href);
                            } catch (e) {
                              // ignore
                            }
                              // ensure only this dropdown is open (close others)
                              setOpenDropdowns([link.label]);
                                  // smooth-center the clicked item within the sidebar
                                  try { (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
                          } else {
                            toggleDropdown(link.label);
                                  try { (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
                          }
                        }}
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
                          {link.children.map((child: any) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={(e) => { setOpenDropdowns([]); try { (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_){} }}
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
                      onClick={(e) => { setOpenDropdowns([]); try { (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_){} }}
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