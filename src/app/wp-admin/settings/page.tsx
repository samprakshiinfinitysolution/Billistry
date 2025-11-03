"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Profile form state (controlled inputs improve accessibility & UX)
  // start empty; will reflect user's input or be populated from an API in a follow-up
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // dirty tracking
  const [isDirty, setIsDirty] = useState(false);

  // mark dirty if any profile or password field changes
  // track original values so Save enables only when something changed
  const originalRef = React.useRef({ fullName: '', email: '', phone: '', role: '', avatarSrc: null as string | null });

  useEffect(() => {
    const dirty = (
      fullName !== originalRef.current.fullName ||
      email !== originalRef.current.email ||
      phone !== originalRef.current.phone ||
      role !== originalRef.current.role ||
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0 ||
      avatarSrc !== originalRef.current.avatarSrc
    );
    setIsDirty(dirty);
  }, [fullName, email, phone, role, currentPassword, newPassword, confirmPassword, avatarSrc]);

  // load current admin user info (email/name/role) from server if available
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        // Try the admin me endpoint first (superadmin-aware)
        let res = await fetch('/api/admin/auth/me');
        if (!mounted) return;

        // If admin endpoint is unauthorized or not available, fall back to generic auth/me
        if (!res.ok) {
          res = await fetch('/api/auth/me');
        }

        if (!mounted) return;
        if (!res.ok) {
          setLoadingProfile(false);
          return;
        }

        const data = await res.json();
        // server returns { id, name, email, role, ... }
        setFullName(data.name || '');
        setEmail(data.email || '');
        setRole(data.role || '');
        // set original snapshot so dirty-tracking compares to server values
        originalRef.current = { fullName: data.name || '', email: data.email || '', phone: data.phone || '', role: data.role || '', avatarSrc: null };
      } catch (err) {
        // ignore - keep empty
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  // validate password when new or confirm changes
  useEffect(() => {
    if (!newPassword && !confirmPassword) {
      setPasswordError('');
      return;
    }
    if (newPassword.length > 0 && newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
  }, [newPassword, confirmPassword]);

  function handleAvatarChoose() {
    avatarInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function handleSave() {
    // simple client-side validation
    if (passwordError) return;

    // pretend save: in a real app we'd call an API route here
    setSavedMessage('Settings saved');
    setTimeout(() => setSavedMessage(null), 3000);
    setIsDirty(false);
    // clear password inputs for safety
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function handleDelete() {
    const ok = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (ok) {
      // placeholder: call delete API
      alert('Account deletion requested');
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-full pt-6 pb-6">
      <div className="flex items-center justify-between px-0 lg:px-0 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-violet-700">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and application preferences</p>
        </div>

        <div>
          <Button
            onClick={handleSave}
            disabled={!isDirty || Boolean(passwordError)}
            aria-disabled={!isDirty || Boolean(passwordError)}
            title={!isDirty ? 'No changes to save' : passwordError ? passwordError : 'Save changes'}
            className={`bg-violet-600 hover:bg-violet-700 text-white ${!isDirty || passwordError ? 'opacity-60 cursor-not-allowed hover:bg-violet-600' : ''}`}
          >
            Save Changes
          </Button>
          {savedMessage && <div className="text-sm text-green-600 mt-2">{savedMessage}</div>}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardContent>
            <div className="flex items-start gap-6">
              <div>
                <div className="bg-violet-50 rounded-md p-3 inline-flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <button type="button" onClick={handleAvatarChoose} className="rounded-full overflow-hidden w-12 h-12 focus:outline-none focus:ring-2 focus:ring-violet-400">
                      {avatarSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarSrc} alt="Avatar" className="w-12 h-12 object-cover rounded-full" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 text-gray-700 flex items-center justify-center rounded-full">D</div>
                      )}
                    </button>
                    <input ref={avatarInputRef} onChange={handleAvatarChange} type="file" accept="image/*" className="hidden" />
                    <div className="text-xs text-gray-500 mt-1">Change</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Profile Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Manage your personal information and preferences</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm text-gray-600 mb-1">Full Name</label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">Phone</label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm text-gray-600 mb-1">Role</label>
                    <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
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
                <label htmlFor="currentPassword" className="block text-sm text-gray-600 mb-1">Current Password</label>
                <div className="relative max-w-md">
                  <Input id="currentPassword" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle current password visibility" onClick={() => setShowCurrent(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm text-gray-600 mb-1">New Password</label>
                <div className="relative max-w-md">
                  <Input id="newPassword" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle new password visibility" onClick={() => setShowNew(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                <div className="relative max-w-md">
                  <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10 h-9" />
                  <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirm(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && <div className="text-sm text-red-600 mt-2">{passwordError}</div>}
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
                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
