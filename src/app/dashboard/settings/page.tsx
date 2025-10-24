'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';

const defaultPermissions = {
  viewReports: false,
  manageBilling: false,
  accessInventory: false,
  manageStaff: false,
  editBusinessProfile: false,
  handlePayments: false,
  deleteRecords: false,
  exportData: false,
};

const permissionLabels: { [key: string]: string } = {
  viewReports: 'View Reports',
  manageBilling: 'Manage Billing',
  accessInventory: 'Access Inventory',
  manageStaff: 'Manage Staff',
  editBusinessProfile: 'Edit Business Profile',
  handlePayments: 'Handle Payments',
  deleteRecords: 'Delete Records',
  exportData: 'Export Data',
};

export default function SettingsPage() {
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/staff/permissions')
      .then((res) => {
        setPermissions(res.data.permissions || defaultPermissions);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to fetch permissions');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof typeof defaultPermissions) => {
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);

    axios
      .post('/api/staff/permissions', updated)
      .then(() => toast.success(`${permissionLabels[key]} permission updated`))
      .catch(() => toast.error(`Failed to update ${permissionLabels[key]}`));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-xl border rounded-2xl">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Admin Permission Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.keys(defaultPermissions).map((_, i) => (
                <div key={i} className="flex justify-between items-center space-x-2">
                  <Skeleton className="w-40 h-5 rounded-md" />
                  <Skeleton className="w-12 h-6 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-gray-50 dark:bg-zinc-900 px-4 py-3 rounded-xl border"
                >
                  <Label
                    htmlFor={key}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={permissions[key as keyof typeof defaultPermissions]}
                    onCheckedChange={() =>
                      handleToggle(key as keyof typeof defaultPermissions)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
