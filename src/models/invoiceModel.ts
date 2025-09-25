import mongoose, { Schema, Document } from 'mongoose';

type InvoiceType = 'sale' | 'purchase';
type InvoiceStatus = 'Paid' | 'Pending' | 'Cancelled';

interface IInvoiceItem {
  item: mongoose.Types.ObjectId;   // Reference to Item
  description?: string;
  quantity: number;
  rate: number;

  // GST components, optional but recommended for detailed invoices
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;

  amount: number;      // quantity * rate (before GST)
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;

  totalAmount: number; // amount + gst components
}

export interface IInvoice extends Document {
  invoiceNo: string;
  type: InvoiceType;
  party: mongoose.Types.ObjectId;         // Customer or Supplier id
  partyModel: 'Customer' | 'Supplier';    // Needed for dynamic ref population
  date: Date;
  status: InvoiceStatus;
  items: IInvoiceItem[];
  subTotal: number;       // sum of amount (before tax)
  cgstTotal?: number;     // sum of all cgstAmount
  sgstTotal?: number;     // sum of all sgstAmount
  igstTotal?: number;     // sum of all igstAmount
  totalGst?: number;      // cgstTotal + sgstTotal + igstTotal
  total: number;          // subTotal + totalGst
  paymentStatus: string;
  remarks?: string;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  cgstRate: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
  igstRate: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
});

const invoiceSchema = new Schema<IInvoice>({
  invoiceNo: { type: String, required: true, unique: true },
  type: { type: String, enum: ['sale', 'purchase'], required: true },
  party: { type: Schema.Types.ObjectId, required: true, refPath: 'partyModel' },
  partyModel: { type: String, required: true, enum: ['Customer', 'Supplier'] },
  date: { type: Date, required: true, default: () => new Date() },
  status: { type: String, enum: ['Paid', 'Pending', 'Cancelled'], default: 'Pending' },
  items: [invoiceItemSchema],
  subTotal: { type: Number, required: true },
  cgstTotal: { type: Number, default: 0 },
  sgstTotal: { type: Number, default: 0 },
  igstTotal: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: { type: String, default: 'unpaid' },
  remarks: { type: String },
}, { timestamps: true });

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
