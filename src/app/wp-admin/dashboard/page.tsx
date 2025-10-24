// /app/wp-admin/dashboard/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Home,
  Users,
  PlaySquare,
  Bell,
  LineChart,
  Settings,
  FileText,
  LogOut,
  ChevronDown,
  PlusCircle,
  Send,
  Settings2,
  MoreVertical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line as RechartsLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// live data state will replace previous mock data
const COLORS = ['#5F2EEA', '#E2E8F0'];

// Recent activity will be fetched from audit logs (subscription-related events)

// Reusable Components (can be moved to their own files)
const NavItem = ({ icon: Icon, text, active = false }: { icon: React.ElementType, text: string, active?: boolean }) => (
  <a href="#" className={`flex items-center px-4 py-3 text-white rounded-lg ${active ? 'bg-purple-700' : 'hover:bg-purple-700/50'}`}>
    <Icon className="w-5 h-5 mr-3" />
    <span>{text}</span>
  </a>
);

const KpiCard = ({ title, value }: { title: string, value: string }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-purple-800">{value}</div>
    </CardContent>
  </Card>
);

// Main Dashboard Page Component
export default function DashboardPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'day'|'month'|'custom'|'all'>('month');
  const [scope, setScope] = useState<'my'|'all'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shopkeepers, setShopkeepers] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [totals, setTotals] = useState<any>({ sales: 0, purchases: 0, expenses: 0, customers: 0, suppliers: 0, items: 0 });
  const [trends, setTrends] = useState<{ sales: any[]; purchases: any[] }>({ sales: [], purchases: [] });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<{ active: number; expired: number; cancelled: number }>({ active: 0, expired: 0, cancelled: 0 });
  const [loading, setLoading] = useState(false);

  async function fetchDashboardData(userOverride?: any) {
    try {
      setLoading(true);
      const user = userOverride ?? currentUser;

      let data: any = null;

      // If the session belongs to a shopkeeper or staff, always fetch the scoped dashboard
      if (user && (user.role === 'shopkeeper' || user.role === 'staff')) {
        const qs = new URLSearchParams();
        qs.set('filter', filter);
        const res = await fetch(`/api/dashboard?${qs.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        data = await res.json();
      } else {
        // Not a shopkeeper/staff session: attempt public view-as for all/business view when scope === 'all'
        if (scope === 'all') {
          try {
            const params = new URLSearchParams();
            params.set('public', '1');
            params.set('filter', filter);
            if (selectedBusiness) params.set('businessId', selectedBusiness);
            const resv = await fetch(`/api/admin/view-as?${params.toString()}`);
            if (resv.ok) {
              const payload = await resv.json();
              if (payload?.data) data = payload.data;
            }
          } catch (err) {
            console.error('public view-as fetch failed', err);
          }
        }

        if (!data) {
          const qs = new URLSearchParams();
          qs.set('filter', filter);
          if (scope === 'all') qs.set('scope', 'all');
          const res = await fetch(`/api/dashboard?${qs.toString()}`);
          if (!res.ok) throw new Error('Failed to fetch dashboard');
          data = await res.json();
        }
      }

      setTotals(data.totals || {});
      setTrends(data.trends || { sales: [], purchases: [] });

      // If dashboard didn't include activeSubscriptions, try the stats endpoint as a fallback
      try {
        if (!data.totals || !data.totals.activeSubscriptions) {
          const qs = new URLSearchParams();
          if (scope === 'all') qs.set('public', '1');
          if (selectedBusiness) qs.set('businessId', selectedBusiness);
          const sres = await fetch(`/api/admin/subscriptions/stats?${qs.toString()}`);
          if (sres.ok) {
            const js = await sres.json();
            if (js.totals && js.totals.active !== undefined) {
              setTotals((t: any) => ({ ...t, activeSubscriptions: js.totals.active }));
              setSubscriptionBreakdown((_) => ({ active: js.totals.active || 0, expired: js.totals.expired || 0, cancelled: js.totals.none || 0 }));
            }
          }
        }
      } catch (err) {
        // ignore
      }

      // fetch recent audit logs for Recent Activity (try admin endpoint first if viewing all)
      try {
        const params = new URLSearchParams();
        params.set('limit', '8');
        if (scope === 'all' && selectedBusiness) params.set('businessId', selectedBusiness);
        if (scope === 'all' && !selectedBusiness) params.set('public', '1');
        const rlogs = await fetch(`/api/admin/audit-logs?${params.toString()}`);
        if (rlogs.ok) {
          const jr = await rlogs.json();
          setRecentActivity(jr.items || []);
        } else {
          // fallback to scoped audit logs
          const r2 = await fetch(`/api/audit-logs?limit=8`);
          if (r2.ok) {
            const j2 = await r2.json();
            setRecentActivity(j2.items || []);
          }
        }
      } catch (err) {
        console.error('failed to fetch audit logs', err);
      }

      // compute subscription breakdown from totals or by querying subscriptions if needed
      try {
        // prefer dashboard totals.activeSubscriptions; to compute expired/cancelled, query businesses if permitted
        const active = data.totals?.activeSubscriptions || 0;
        let expired = 0;
        let cancelled = 0;

        // try to fetch a simple status breakdown via admin audit logs (subscription change events)
        try {
          const resp = await fetch('/api/admin/audit-logs?limit=200');
          if (resp.ok) {
            const jr = await resp.json();
            const items = jr.items || [];
            // look for actions mentioning subscription or plan
            for (const it of items) {
              const action = (it.action || '').toLowerCase();
              if (action.includes('cancel') || action.includes('cancelled')) cancelled += 1;
              if (action.includes('expire') || action.includes('expired')) expired += 1;
            }
          }
        } catch (err) {
          // ignore
        }

        setSubscriptionBreakdown({ active, expired, cancelled });
      } catch (err) {
        console.error('failed to compute subscription breakdown', err);
      }

      // If audit logs were empty and subscription breakdown is still zeros, fall back to business-derived stats
      try {
        if ((recentActivity.length === 0) || (subscriptionBreakdown.active === 0 && subscriptionBreakdown.expired === 0 && subscriptionBreakdown.cancelled === 0)) {
          const qs = new URLSearchParams();
          if (scope === 'all') qs.set('public', '1');
          if (selectedBusiness) qs.set('businessId', selectedBusiness);
          qs.set('limit', '12');
          const sres = await fetch(`/api/admin/subscriptions/stats?${qs.toString()}`);
          if (sres.ok) {
            const js = await sres.json();
            if (js.totals) {
              setSubscriptionBreakdown({ active: js.totals.active || 0, expired: js.totals.expired || 0, cancelled: js.totals.none || 0 });
            }
            if (js.recent && js.recent.length > 0 && recentActivity.length === 0) {
              // convert recent businesses into activity-like items for display
              const mapped = js.recent.map((r: any) => ({ action: 'subscription:update', user: null, after: { businessName: r.name, subscriptionExpiry: r.subscriptionExpiry }, createdAt: r.updatedAt }));
              setRecentActivity(mapped);
            }
          }
        }
      } catch (err) {
        // ignore
      }

      // If superadmin viewing all, also fetch all shopkeepers
      if (scope === 'all' && currentUser?.role === 'superadmin') {
        try {
          const r2 = await fetch('/api/users?role=shopkeeper');
          if (r2.ok) {
            const users = await r2.json();
            setShopkeepers(users || []);
            // ensure totals.shopkeepers is set if API didn't include it
            if (!data.totals || data.totals.shopkeepers === undefined) {
              setTotals((t: any) => ({ ...t, shopkeepers: users.length }));
            }
          }
        } catch (err) {
          console.error('failed to fetch shopkeepers', err);
        }
      }
    } catch (err) {
      console.error('dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // fetch current user first
    (async () => {
      try {
        const me = await fetch('/api/auth/me');
        if (me.ok) {
          const u = await me.json();
          setCurrentUser(u);
          // set default scope: if not logged in or not a shopkeeper/staff -> show all
          if (!u || (u.role !== 'shopkeeper' && u.role !== 'staff')) {
            setScope('all');
          } else {
            setScope('my');
          }

          // fetch businesses list for superadmin
          if (u?.role === 'superadmin') {
            try {
              const bres = await fetch('/api/business');
              if (bres.ok) {
                const jb = await bres.json();
                setBusinesses(jb.businesses || []);
              }
            } catch (err) {
              console.error('failed to fetch businesses', err);
            }
          }
        }
      } catch (err) {
        console.error('failed to fetch /api/auth/me', err);
      }
      await fetchDashboardData();
    })();
    const id = setInterval(fetchDashboardData, 15000); // poll every 15s
    return () => clearInterval(id);
  }, [filter]);

  // re-fetch when scope changes
  useEffect(() => {
    fetchDashboardData();
  }, [scope]);

  const lineChartData = useMemo(() => {
    // prefer sales trend; if empty, fallback to purchases
    const source = (trends.sales && trends.sales.length > 0) ? trends.sales : trends.purchases;
    return source.map((s: any) => ({ name: s.date, value: s.total }));
  }, [trends]);

  const pieChartData = useMemo(() => {
    // represent sales vs purchases share
    const sales = totals.sales || 0;
    const purchases = totals.purchases || 0;
    const total = Math.max(1, sales + purchases);
    return [
      { name: 'Sales', value: Math.round((sales / total) * 100) },
      { name: 'Purchases', value: Math.round((purchases / total) * 100) },
    ];
  }, [totals]);

  const kpiData = useMemo(() => {
    const fmt = (v: any) => {
      const n = Number(v || 0);
      return n.toLocaleString();
    };

    // Show superadmin-style KPIs when viewing global scope (scope === 'all')
    if (scope === 'all') {
      return [
        { title: 'Total Businesses', value: fmt(totals.businesses) },
        { title: 'Total Shopkeepers', value: fmt(totals.shopkeepers) },
        { title: 'Total Staff', value: fmt(totals.staff) },
        { title: 'Active Subscriptions', value: fmt(totals.activeSubscriptions) },
      ];
    }

    return [
      { title: 'Total Shopkeepers', value: fmt(totals.shopkeepers ?? totals.customers) },
      { title: 'Total Items', value: fmt(totals.items) },
      { title: 'Total Revenue', value: fmt(totals.sales) },
      { title: 'Total Expenses', value: fmt(totals.expenses) },
    ];
  }, [totals, currentUser]);
  return (
    <div className="pt-6 pb-6">
    <div className="flex flex-col xl:flex-row gap-6">

  <div className="flex flex-col xl:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">{scope === 'all' ? 'Global Overview' : 'Overview'}</div>
              <div className="flex items-center space-x-2">
                {scope === 'all' && currentUser?.role === 'superadmin' && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedBusiness ?? ''}
                      onChange={async (e) => {
                        const bid = e.target.value || null;
                        setSelectedBusiness(bid);
                        if (bid) {
                          try {
                            const r = await fetch('/api/admin/view-as', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ businessId: bid, filter }),
                            });
                            if (r.ok) {
                              const payload = await r.json();
                              if (payload?.data) {
                                setTotals(payload.data.totals || {});
                                setTrends(payload.data.trends || { sales: [], purchases: [] });
                              }
                            }
                          } catch (err) {
                            console.error('view-as failed', err);
                          }
                        }
                      }}
                      className="px-2 py-1 rounded-md bg-white border"
                    >
                      <option value="">Select business</option>
                      {businesses.map((b: any) => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((kpi, index) => (
                <KpiCard key={index} title={kpi.title} value={kpi.value} />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <RechartsLineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <RechartsLine type="monotone" dataKey="value" stroke="#5F2EEA" strokeWidth={2} dot={false} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm flex items-center justify-center">
                <CardContent className="pt-6">
                   <div style={{ width: 200, height: 200, position: 'relative' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-gray-700">
                      Active
                    </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        Plan <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Monthly</DropdownMenuItem>
                      <DropdownMenuItem>Annual</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        Status <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Active</DropdownMenuItem>
                      <DropdownMenuItem>Expired</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-500">Event</TableHead>
                      <TableHead className="text-gray-500">Actor</TableHead>
                      <TableHead className="text-gray-500">Details</TableHead>
                      <TableHead className="text-gray-500">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((log: any, index: number) => (
                      <TableRow key={log._id || index}>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{(log.user && log.user.name) || log.user || (log.before && log.before.name) || '—'}</TableCell>
                        <TableCell className="max-w-xs truncate">{(log.after && JSON.stringify(log.after)) || (log.before && JSON.stringify(log.before)) || log.resourceType || ''}</TableCell>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {recentActivity.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-sm text-gray-500">No recent activity available.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="w-full xl:w-72 flex-shrink-0 flex flex-col gap-6">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Subscriptions Overview</CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const total = subscriptionBreakdown.active + subscriptionBreakdown.expired + subscriptionBreakdown.cancelled || Math.max(1, (totals.businesses || 0));
                  const pct = (n: number) => Math.round((n / total) * 100);
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          <span>Active ({subscriptionBreakdown.active || totals.activeSubscriptions || 0})</span>
                        </div>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct(subscriptionBreakdown.active || totals.activeSubscriptions || 0)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                          <span>Expired ({subscriptionBreakdown.expired})</span>
                        </div>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${pct(subscriptionBreakdown.expired)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                          <span>No Plan ({subscriptionBreakdown.cancelled})</span>
                        </div>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${pct(subscriptionBreakdown.cancelled)}%` }}></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-3">
                <Button variant="outline" className="justify-start" onClick={() => router.push('/wp-admin/manage-admins/add')}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Admin
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push('/wp-admin/notifications/send')}>
                  <Send className="mr-2 h-4 w-4" /> Send Notification
                </Button>
                {/* Global Search removed - not available */}
              </CardContent>
            </Card>

            {scope === 'all' && shopkeepers.length > 0 && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Shopkeepers ({shopkeepers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {shopkeepers.slice(0, 20).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.email || s.phone}</div>
                        </div>
                        <div className="text-xs text-gray-400">{s.business?.toString?.() ?? ''}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
    </div>
  );
}