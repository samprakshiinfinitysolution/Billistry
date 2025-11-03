'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X, User, Mail, Phone, Building, MessageSquare } from 'lucide-react';

interface RequestDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IFormInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function RequestDemo({ isOpen, onClose }: RequestDemoProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<IFormInput>({
    mode: 'onBlur', // Validate on blur for better UX
  });

  

  // Handle closing modal on Escape key press or outside click
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: 'Product Demo Request',
          message: `Phone: ${data.phone}\nCompany: ${data.company}\nMessage: ${data.message}`,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Demo request sent successfully! We will be in touch shortly.');
        reset();
        onClose();
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  // Reset form when modal is opened/closed
  useEffect(() => { reset(); }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div ref={modalRef} className="relative w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Request a Demo</h2>
          <p className="text-gray-500 mt-2 text-sm">See how Billistry can transform your business.</p>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClose()}
            className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Full Name" {...register('name', { required: 'Full Name is required' })} className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#460F58]'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-2">{errors.name.message}</p>}
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="email" placeholder="Email Address" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#460F58]'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message}</p>}
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="tel" placeholder="Phone Number" {...register('phone', { required: 'Phone number is required', minLength: { value: 10, message: 'Must be at least 10 digits' } })} className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#460F58]'}`} />
            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-2">{errors.phone.message}</p>}
          </div>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Company Name (Optional)" {...register('company')} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#460F58]" />
          </div>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
            <textarea placeholder="Your Message (Optional)" {...register('message')} rows={3} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#460F58] resize-none" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold py-3 rounded-lg transition-all bg-[#460F58] text-white hover:bg-[#370a46] disabled:bg-[#460F58]/50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}