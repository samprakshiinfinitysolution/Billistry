import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INewSaleItem {
  name: string;
  hsn?: string;
  qty: number;
  price: number;
  productId?: string | any;
  discountPercentStr?: string;
  discountAmountStr?: string;
  lastDiscountInput?: 'percent' | 'flat';
  taxPercentStr?: string;
  taxAmountStr?: string;
}

export interface ICharge {
  id?: number | string;
  name?: string;
  amount?: string;
}

export interface INewSale extends Document {
  business: Types.ObjectId;
  invoiceNumber: number;
  invoiceNo?: string;
  invoiceDate?: Date | string;
  dueDate?: Date | string;
  paymentTerms?: string;
  paymentStatus?: 'unpaid' | 'cash' | 'upi' | 'card' | 'netbanking' | 'bank' | 'bank_transfer' | 'cheque' | 'online';
  // Overall/global discount fields (UI supports percent/flat and before/after tax)
  discountOption?: 'before-tax' | 'after-tax';
  discountPercentStr?: string;
  discountFlatStr?: string;
  selectedParty?: Types.ObjectId | any;
  items: INewSaleItem[];
  additionalCharges: ICharge[];
  terms?: string;
  notes?: string;
  autoRoundOff?: boolean;
  // manual adjustment applied via UI (+ Add / - Reduce)
  adjustmentType?: 'add' | 'subtract';
  manualAdjustment?: number;
  totalAmount?: number;
  amountReceived?: number;
  balanceAmount?: number;
  savedAt?: Date;
  isDeleted?: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const newSaleItemSchema = new Schema<INewSaleItem>({
  name: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  hsn: { type: String },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPercentStr: { type: String },
  discountAmountStr: { type: String },
  lastDiscountInput: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  taxPercentStr: { type: String },
  taxAmountStr: { type: String },
});

const chargeSchema = new Schema<ICharge>({
  id: { type: Schema.Types.Mixed },
  name: { type: String },
  amount: { type: String },
});

const newSaleSchema = new Schema<INewSale>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    invoiceNumber: { type: Number, required: true },
  invoiceNo: { type: String },
    invoiceDate: { type: Schema.Types.Mixed },
    dueDate: { type: Schema.Types.Mixed },
    paymentTerms: { type: String },
    paymentStatus: { type: String, enum: ['unpaid', 'cash', 'upi', 'card', 'netbanking', 'bank', 'bank_transfer', 'cheque', 'online'], default: 'unpaid' },
    selectedParty: { type: Schema.Types.ObjectId, ref: 'Party' },
    items: { type: [newSaleItemSchema], default: [] },
  additionalCharges: { type: [chargeSchema], default: [] },
  discountOption: { type: String, enum: ['before-tax', 'after-tax'], default: 'before-tax' },
  discountPercentStr: { type: String },
  discountFlatStr: { type: String },
    terms: { type: String, default: '' },
    notes: { type: String, default: '' },
    // whether auto round off was applied when saving this invoice
  autoRoundOff: { type: Boolean, default: false },
  // manual adjustment applied via UI (+ Add / - Reduce)
  adjustmentType: { type: String, enum: ['add', 'subtract'], default: 'add' },
  manualAdjustment: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountReceived: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    savedAt: { type: Date, default: () => new Date() },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// unique invoiceNumber per business
newSaleSchema.index({ business: 1, invoiceNumber: 1 }, { unique: false });

// When running in dev with module hot-reloading, Mongoose may already have a cached
// model registered under the same name with an older schema (missing new enum values).
// Delete the cached model if present so we can register the updated schema and enum.
if (mongoose.connection && mongoose.connection.models && (mongoose.connection.models as any).NewSale) {
  try {
    delete (mongoose.connection.models as any).NewSale;
  } catch (e) {
    // ignore
  }
}

export const NewSale = (mongoose.models.NewSale as mongoose.Model<INewSale>) || mongoose.model<INewSale>('NewSale', newSaleSchema);

export default NewSale;