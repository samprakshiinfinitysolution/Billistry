'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { ChevronDown, X } from 'lucide-react';

// Reusable components from your project
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }) => (
    <button
        {...props}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${props.className}`}
    >
        {children}
    </button>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        {...props}
        ref={ref}
        className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
    />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
    <textarea
        {...props}
        ref={ref}
        className={`flex min-h-[60px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${props.className}`}
    />
));
Textarea.displayName = "Textarea";


const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        type="checkbox"
        {...props}
        ref={ref}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${props.className}`}
    />
));
Checkbox.displayName = "Checkbox";

interface CreatePartyProps {
    isOpen: boolean;
    onClose: () => void;
    partyType: 'Customer' | 'Supplier';
    onSaveSuccess: (newPartyData: any) => void;
}

export const CreateParty: React.FC<CreatePartyProps> = ({ isOpen, onClose, partyType, onSaveSuccess }) => {
    const { register, handleSubmit, control, watch, formState: { errors, isValid, isSubmitting }, reset, setError } = useForm({
        mode: 'onChange',
        defaultValues: {
            partyName: '',
            mobileNumber: '',
            billingAddress: '',
            shippingSameAsBilling: false,
            shippingAddress: '',
            gstin: ''
        }
    });

    const [showAddress, setShowAddress] = useState(false);
    const [showGstin, setShowGstin] = useState(false);

    const shippingSameAsBilling = watch('shippingSameAsBilling');

    const handleClose = () => {
        reset(); // Reset form fields
        onClose();
    };

    const onSubmit = async (data: any) => {
        const payload = {
            ...data,
            partyType: partyType,
        };

        try {
            const res = await fetch('/api/parties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(`${partyType} created successfully!`);
                onSaveSuccess(result.party); // Pass the new party data back
                handleClose();
            } else {
                if (result.error && result.error.toLowerCase().includes('mobile number already exists')) {
                    setError('mobileNumber', {
                        type: 'manual',
                        message: result.error,
                    });
                } else {
                    toast.error(result.error || 'Failed to create party.');
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred.');
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Create New Party</h2>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form id="create-party-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Party Name *</label>
                        <Input {...register("partyName", { required: "This field is mandatory" })} className={`mt-1 ${errors.partyName ? 'border-red-500' : ''}`} />
                        {errors.partyName && <p className="text-red-500 text-xs mt-1">{errors.partyName.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                        <Input {...register("mobileNumber")} className={`mt-1 ${errors.mobileNumber ? 'border-red-500' : ''}`} type="tel" />
                        {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
                    </div>

                    {/* Address Section */}
                    <div className="border-t pt-4">
                        <button type="button" onClick={() => setShowAddress(!showAddress)} className="flex justify-between items-center w-full text-left font-medium text-blue-600">
                            Add Address (Optional)
                            <ChevronDown className={`h-5 w-5 transition-transform ${showAddress ? 'rotate-180' : ''}`} />
                        </button>
                        {showAddress && (
                            <div className="mt-4 space-y-4 pl-2 border-l-2 border-gray-200">
                                <h3 className="font-semibold">Billing Address</h3>
                                <Textarea {...register("billingAddress")} placeholder="Billing Address" rows={3} />
                                <div className="flex items-center gap-2">
                                    <Controller name="shippingSameAsBilling" control={control} render={({ field }) => <Checkbox id="shippingSameAsBilling" checked={field.value} onChange={field.onChange} />} />
                                    <label htmlFor="shippingSameAsBilling" className="text-sm">Shipping address same as billing address</label>
                                </div>
                                {!shippingSameAsBilling && (
                                    <div className="mt-4 space-y-4">
                                        <h3 className="font-semibold">Shipping Address</h3>
                                        <Textarea {...register("shippingAddress")} placeholder="Shipping Address" rows={3} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* GSTIN Section */}
                    <div className="border-t pt-4">
                        <button type="button" onClick={() => setShowGstin(!showGstin)} className="flex justify-between items-center w-full text-left font-medium text-blue-600">
                            Add GSTIN (Optional)
                            <ChevronDown className={`h-5 w-5 transition-transform ${showGstin ? 'rotate-180' : ''}`} />
                        </button>
                        {showGstin && (
                            <div className="mt-4 pl-2 border-l-2 border-gray-200">
                                <Input {...register("gstin")} placeholder="ex: 29XXXXXX9438X1XX" />
                            </div>
                        )}
                    </div>

                </form>

                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-party-form"
                        disabled={!isValid || isSubmitting}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed px-6 py-2 w-24"
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    );
};