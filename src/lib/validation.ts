// src/lib/validation.ts
import { z } from 'zod';

// Base validation schemas
export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
});

export const transactionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMode: z.enum(['Cash', 'Card', 'UPI', 'Netbanking'], {
    message: 'Invalid payment mode',
  }),
  date: z.string().datetime().optional(),
  note: z.string().max(500, 'Note too long').optional(),
});

export const itemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  category: z.string().max(50, 'Category too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

// Update schemas (partial versions)
export const updateSupplierSchema = supplierSchema.partial();
export const updateCustomerSchema = customerSchema.partial();
export const updateTransactionSchema = transactionSchema.partial();
export const updateItemSchema = itemSchema.partial();

// ID validation schema
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Validation helper function
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Middleware function for API route validation
export const withValidation = <T>(schema: z.ZodSchema<T>) => {
  return async (req: Request): Promise<{ success: true; data: T } | { success: false; errors: string[] }> => {
    try {
      const body = await req.json();
      return validateRequest(schema, body);
    } catch {
      return { success: false, errors: ['Invalid JSON body'] };
    }
  };
};