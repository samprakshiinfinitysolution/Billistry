"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // profile state
  const [name, setName] = useState('Durgesh Rajak');
  const [email, setEmail] = useState('durgesh@billistry.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [role, setRole] = useState('Administrator');

  // avatar upload preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const passwordMismatch = !!(newPassword && confirmPassword && newPassword !== confirmPassword);

  useEffect(() => {
    // set dirty when any field differs from initial defaults
    const isDirty = (
      name !== 'Durgesh Rajak' ||
      email !== 'durgesh@billistry.com' ||
      phone !== '+91 9876543210' ||
      role !== 'Administrator' ||
      !!avatarFile ||
      !!currentPassword ||
      !!newPassword ||
      !!confirmPassword
    );
    setDirty(isDirty);
    if (isDirty) setSaved(false);
  }, [name, email, phone, role, avatarFile, currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(null); return; }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  async function handleSave() {
    if (passwordMismatch) return;
    setSaving(true);
    setSaved(false);
    try {
      // simulate network save
      await new Promise((r) => setTimeout(r, 800));
      // here you'd call your API to persist profile and password updates
      setSaved(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setAvatarFile(null);
      setDirty(false);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="flex items-center justify-between px-0 lg:px-0 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-violet-700">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and application preferences</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleSave} disabled={!dirty || saving || passwordMismatch}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          {saved && <div className="text-sm text-green-600">Saved ✓</div>}
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
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Role</label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-2">Avatar</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {/* Select / change panel */}
                      <div>
                        <div className="border border-dashed border-gray-300 rounded-md p-4 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-800">Select Image</div>
                              <div className="text-xs text-gray-500 mt-1">PNG, JPG or GIF — up to 2MB</div>
                            </div>
                            <div>
                              <input id="avatar-file-input" type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                              <label htmlFor="avatar-file-input" className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm bg-violet-600 text-white hover:bg-violet-700 cursor-pointer">Choose</label>
                            </div>
                          </div>

                          {avatarFile && (
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="text-sm text-gray-700 truncate">{avatarFile.name}</div>
                              <div className="flex items-center gap-2">
                                <label htmlFor="avatar-file-input" className="inline-flex items-center px-2 py-1 text-sm border rounded-md bg-white hover:bg-gray-50 cursor-pointer">Change</label>
                                <button type="button" onClick={() => setAvatarFile(null)} className="inline-flex items-center px-2 py-1 text-sm border rounded-md bg-white hover:bg-gray-50">Remove</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preview panel */}
                      <div>
                        <div className="border rounded-md p-4 bg-white h-full flex flex-col items-center justify-center">
                          <div className="text-sm font-medium text-gray-800 mb-3">Preview</div>
                          <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                            {avatarPreview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-gray-500 text-xl">D</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-3">
                            {avatarFile ? 'Preview of selected image' : 'No image selected'}
                          </div>
                        </div>
                      </div>
                    </div>
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
                  <Input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle current password visibility" onClick={() => setShowCurrent(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <div className="relative max-w-md">
                  <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle new password visibility" onClick={() => setShowNew(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                <div className="relative max-w-md">
                  <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirm(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordMismatch && <div className="text-sm text-red-600 mt-2">New password and confirm password do not match.</div>}
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
