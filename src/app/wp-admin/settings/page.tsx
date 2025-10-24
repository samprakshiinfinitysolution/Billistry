"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="flex items-center justify-between px-0 lg:px-0 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-violet-700">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and application preferences</p>
        </div>

        <div>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">Save Changes</Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardContent>
            <div className="flex items-start gap-6">
              <div>
                  <div className="bg-violet-50 rounded-md p-3 inline-flex items-center justify-center">
                  <Avatar>
                    <div className="w-8 h-8">
                      <div className="w-8 h-8 bg-gray-200 text-gray-700 flex items-center justify-center rounded-full">D</div>
                    </div>
                  </Avatar>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Profile Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                    <Input defaultValue="Durgesh Rajak" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <Input defaultValue="durgesh@billistry.com" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <Input defaultValue="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Role</label>
                    <Input defaultValue="Administrator" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-800">Security</h3>
            <p className="text-sm text-gray-500 mt-1">Update password and security settings</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <div className="relative max-w-md">
                  <Input type={showCurrent ? 'text' : 'password'} defaultValue="12345678" className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle current password visibility" onClick={() => setShowCurrent(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <div className="relative max-w-md">
                  <Input type={showNew ? 'text' : 'password'} defaultValue="87654321" className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle new password visibility" onClick={() => setShowNew(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                <div className="relative max-w-md">
                  <Input type={showConfirm ? 'text' : 'password'} defaultValue="87654321" className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirm(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-200 bg-red-50/30">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
                <p className="text-sm text-red-500 mt-1">Irreversible actions that can affect your account</p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-white border border-red-200 text-red-700 hover:bg-red-50">Export All Data</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">Delete Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
