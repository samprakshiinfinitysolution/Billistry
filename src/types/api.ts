// src/types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Specific response types for different entities
export type SupplierResponse = ApiResponse<Supplier>;
export type SuppliersResponse = ApiResponse<Supplier[]>;

export type CustomerResponse = ApiResponse<Customer>;
export type CustomersResponse = ApiResponse<Customer[]>;

export type TransactionResponse = ApiResponse<Transaction>;
export type TransactionsResponse = ApiResponse<Transaction[]>;

export type ItemResponse = ApiResponse<Item>;
export type ItemsResponse = ApiResponse<Item[]>;

// Entity types (should match your models)
export interface Supplier {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  _id?: string;
  customerId: string;
  amount: number;
  paymentMode: "Cash" | "Card" | "UPI" | "Netbanking";
  date: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request types for creating/updating entities
export interface CreateSupplierRequest {
  name: string;
  email: string;
  phone: string;
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
}

export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export interface CreateTransactionRequest {
  customerId: string;
  amount: number;
  paymentMode: "Cash" | "Card" | "UPI" | "Netbanking";
  date?: string;
  note?: string;
}

export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

export interface CreateItemRequest {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
}

export type UpdateItemRequest = Partial<CreateItemRequest>;