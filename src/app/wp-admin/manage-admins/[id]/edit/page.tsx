"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { X, UploadCloud } from 'lucide-react';
import { getAdmin, updateAdmin, refreshAdmins } from '../../data';

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FormField = ({ label, required, className, children, error }: { label: string; required?: boolean; className?: string; error?: string; children: React.ReactNode; }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const ImageUpload = ({ label, file, previewUrl, onFileSelect, onClear }: { label: string; file: File | null; previewUrl: string | null; onFileSelect: (f: File | null) => void; onClear: () => void; }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return onFileSelect(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) { alert('Invalid file type. Please select PNG/JPG/WEBP.'); return; }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) { alert(`File is too large. Max ${MAX_FILE_SIZE_MB}MB.`); return; }
    onFileSelect(f);
  };

  return (
    <div>
      <div className="w-full h-36 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden">
        <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="hidden" onChange={handleFile} />
        {previewUrl ? (
          <>
            <Image src={previewUrl} alt="preview" fill className="object-contain" />
            <button type="button" onClick={onClear} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600"><X size={16} /></button>
          </>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center gap-2 text-gray-500">
            <UploadCloud size={30} />
            <div className="text-sm font-semibold text-blue-600">{label}</div>
            <div className="text-xs text-gray-400">PNG/JPG, max {MAX_FILE_SIZE_MB}MB</div>
          </button>
        )}
      </div>
    </div>
  );
};

// --- helper lists copied from company settings ---
const INDIAN_STATES: string[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

const BUSINESS_TYPE_OPTIONS: string[] = ['Retailer', 'Wholesaler', 'Distributor', 'Manufacturer', 'Services'];

const INDUSTRY_OPTIONS: string[] = [ 'Accounting and Financial Services', 'Agriculture', 'Automobile', 'Battery', 'Broadband/ cable/ internet', 'Building Material and Construction', 'Cleaning and Pest Control', 'Consulting', 'Dairy (Milk)', 'Doctor / Clinic / Hospital', 'Education-Schooling/Coaching', 'Electrical works', 'Electronics', 'Engineering', 'Event planning and management', 'FMCG', 'Fitness - Gym and Spa', 'Footwear', 'Fruits and Vegetables', 'Furniture', 'Garment/Clothing', 'General Store(Kirana)', 'Gift Shop', 'Hardware', 'Home services', 'Hotels and Hospitality', 'Information Technology', 'Interiors', 'Jewellery', 'Liquor', 'Machinery', 'Meat', 'Medical Devices', 'Medicine(Pharma)', 'Mobile and accessories', 'Oil And Gas', 'Opticals', 'Other services', 'Others', 'Packaging', 'Paints', 'Photography', 'Plywood', 'Printing', 'Real estate - Rentals and Lease', 'Restaurants/ Cafe/ Catering', 'Safety Equipments', 'Salon', 'Scrap', 'Service Centres', 'Sports Equipments', 'Stationery', 'Tailoring/ Boutique', 'Textiles', 'Tiles/Sanitary Ware', 'Tours and Travel', 'Transport and Logistics', 'Utensils' ];

const REGISTRATION_TYPE_OPTIONS: string[] = ['Sole Proprietorship', 'Partnership', 'Limited Liability Partnership (LLP)', 'Private Limited Company', 'Public Limited Company', 'Business Not Registered', 'Other'];

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id || '';
  const [admin, setAdmin] = useState<any>(() => getAdmin(id));
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isGstRegistered, setIsGstRegistered] = useState<'yes' | 'no'>('no');

  useEffect(() => {
    let mounted = true;
    async function ensureAdmin() {
      if (!admin) {
        setLoading(true);
        await refreshAdmins();
        const a = getAdmin(id);
        if (mounted) setAdmin(a);
        setLoading(false);
        return;
      }
      // populate form when admin available
      setForm({ ...admin });
      setIsGstRegistered((admin as any)?.gstNumber ? 'yes' : 'no');
      // if admin already has avatar/signature data URLs, show them
      setPreviewUrl((admin as any).avatar ?? null);
      setSignaturePreview((admin as any).signature ?? null);
    }
    ensureAdmin();
    return () => { mounted = false; };
  }, [admin, id]);

  useEffect(() => {
    if (!avatarFile) return;
    const obj = URL.createObjectURL(avatarFile);
    setPreviewUrl(obj);
    return () => URL.revokeObjectURL(obj);
  }, [avatarFile]);

  useEffect(() => {
    if (!signatureFile) return;
    const obj = URL.createObjectURL(signatureFile);
    setSignaturePreview(obj);
    return () => URL.revokeObjectURL(obj);
  }, [signatureFile]);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading admin...</div>;
  if (!admin) return <div className="p-6 text-center text-gray-600">Admin not found</div>;

  const handleChange = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));

  const handleGstRadioChange = (value: 'yes' | 'no') => { setIsGstRegistered(value); if (value === 'no') handleChange('gstNumber', ''); };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { alert('Name and email are required'); return; }
    try {
      const [avatarData, signatureData] = await Promise.all([
        avatarFile ? fileToDataUrl(avatarFile) : Promise.resolve((form as any).avatar ?? null),
        signatureFile ? fileToDataUrl(signatureFile) : Promise.resolve((form as any).signature ?? null),
      ] as [Promise<string | null>, Promise<string | null>]);

      const patch: any = { ...form };
      if (avatarData) patch.avatar = avatarData;
      else delete patch.avatar;
      if (signatureData) patch.signature = signatureData;

      updateAdmin(id, patch);
      router.push('/wp-admin/manage-admins');
    } catch (err) {
      console.error('Failed to read files', err);
      alert('Failed to read uploaded files. Please try again.');
    }
  };

  const handleClearAvatar = () => { setAvatarFile(null); setPreviewUrl(null); };
  const handleClearSignature = () => { setSignatureFile(null); setSignaturePreview(null); };

  const togglePick = (key: 'businessTypes' | 'industryTypes', value: string) => {
    setForm((prev: any) => {
      const arr = (prev?.[key] ?? []) as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(a => a !== value) : [...arr, value] } as any;
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <form onSubmit={handleSave} className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Admin</h1>
              <p className="text-sm text-gray-500">Update admin and company details (UI only)</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/wp-admin/manage-admins')}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Full name" required>
                  <Input value={form?.name ?? ''} onChange={(e: any) => handleChange('name', e.target.value)} placeholder="e.g. John Doe" />
                </FormField>

                <FormField label="Email" required>
                  <Input type="email" value={form?.email ?? ''} onChange={(e: any) => handleChange('email', e.target.value)} placeholder="admin@example.com" />
                </FormField>

                <FormField label="Phone">
                  <Input value={form?.phone ?? ''} onChange={(e: any) => handleChange('phone', e.target.value)} placeholder="Mobile number" />
                </FormField>

                <FormField label="Password">
                  <Input type="password" value={form?.password ?? ''} onChange={(e: any) => handleChange('password', e.target.value)} placeholder="Enter password" />
                </FormField>

                <FormField label="Confirm password">
                  <Input type="password" value={form?.confirm ?? ''} onChange={(e: any) => handleChange('confirm', e.target.value)} placeholder="Confirm password" />
                </FormField>

                <FormField label="Store name">
                  <Input value={form?.store ?? ''} onChange={(e: any) => handleChange('store', e.target.value)} placeholder="Store or business name" />
                </FormField>

                <FormField label="Website">
                  <Input value={form?.website ?? ''} onChange={(e: any) => handleChange('website', e.target.value)} placeholder="https://example.com" />
                </FormField>

                <FormField label="Currency">
                  <Input value={(form as any)?.currency ?? 'INR'} onChange={(e: any) => handleChange('currency', e.target.value)} placeholder="INR" />
                </FormField>

                <FormField label="Timezone">
                  <Input value={(form as any)?.timezone ?? 'Asia/Kolkata'} onChange={(e: any) => handleChange('timezone', e.target.value)} placeholder="Asia/Kolkata" />
                </FormField>

                <FormField label="Address" className="md:col-span-2">
                  <textarea rows={3} value={form?.address ?? ''} onChange={(e) => handleChange('address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </FormField>

                <FormField label="State">
                  <select value={form?.state ?? ''} onChange={(e) => handleChange('state', e.target.value)} className="w-full border rounded-md px-3 py-2">
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.sort().map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>

                <FormField label="City">
                  <Input value={form?.city ?? ''} onChange={(e: any) => handleChange('city', e.target.value)} placeholder="City" />
                </FormField>

                <FormField label="Pincode">
                  <Input value={form?.pincode ?? ''} onChange={(e: any) => handleChange('pincode', e.target.value)} placeholder="Pincode" />
                </FormField>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Are you GST Registered?</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gst-registered" value="yes" checked={isGstRegistered === 'yes'} onChange={() => handleGstRadioChange('yes')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/> Yes</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gst-registered" value="no" checked={isGstRegistered === 'no'} onChange={() => handleGstRadioChange('no')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/> No</label>
                  </div>
                  {isGstRegistered === 'yes' && (
                    <div className="mt-3">
                      <FormField label="GST Number">
                        <Input value={form?.gstNumber ?? ''} onChange={(e: any) => handleChange('gstNumber', e.target.value)} placeholder="Enter GST Number" />
                      </FormField>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <FormField label="Profile image">
                  <ImageUpload label="Upload profile image" file={avatarFile} previewUrl={previewUrl} onFileSelect={setAvatarFile} onClear={handleClearAvatar} />
                </FormField>

                <FormField label="Signature">
                  <ImageUpload label="Upload Signature" file={signatureFile} previewUrl={signaturePreview} onFileSelect={setSignatureFile} onClear={handleClearSignature} />
                </FormField>

                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <FormField label="Business Type">
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_TYPE_OPTIONS.map((opt: string) => (
                        <button key={opt} type="button" onClick={() => togglePick('businessTypes', opt)} className={`px-3 py-1 rounded-md text-sm ${ (form?.businessTypes ?? []).includes(opt) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Industry Type">
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {INDUSTRY_OPTIONS.slice(0,30).map((opt: string) => (
                        <button key={opt} type="button" onClick={() => togglePick('industryTypes', opt)} className={`px-3 py-1 rounded-md text-sm ${(form?.industryTypes ?? []).includes(opt) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Registration Type">
                    <select value={form?.registrationType ?? ''} onChange={(e) => handleChange('registrationType', e.target.value)} className="w-full border rounded-md px-3 py-2">
                      <option value="" disabled>Select</option>
                      {REGISTRATION_TYPE_OPTIONS.map((r: string) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </FormField>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-sm">Enable e-invoicing</span><ToggleSwitch enabled={form?.enableEInvoicing ?? false} onChange={(v) => handleChange('enableEInvoicing', v)} /></div>
                    <div className="flex items-center justify-between"><span className="text-sm">Enable TDS</span><ToggleSwitch enabled={form?.enableTds ?? false} onChange={(v) => handleChange('enableTds', v)} /></div>
                    <div className="flex items-center justify-between"><span className="text-sm">Enable TCS</span><ToggleSwitch enabled={form?.enableTcs ?? false} onChange={(v) => handleChange('enableTcs', v)} /></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <FormField label="Status">
                    <select value={form?.status ?? 'Active'} onChange={(e) => handleChange('status', e.target.value)} className="w-full border rounded-md px-3 py-2">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </FormField>

                  <FormField label="Plan">
                    <select value={form?.plan ?? 'Standard'} onChange={(e) => handleChange('plan', e.target.value)} className="w-full border rounded-md px-3 py-2">
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                      <option value="Basic">Basic</option>
                    </select>
                  </FormField>

                  <div className="text-sm text-gray-500">You can change these settings later.</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}
