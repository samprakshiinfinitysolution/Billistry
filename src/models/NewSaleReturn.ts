
import mongoose, { Schema, Document, Types } from 'mongoose';
import { INewSaleItem, ICharge } from './NewSale';

export interface INewSaleReturn extends Document {
  business: Types.ObjectId;
  originalSale: Types.ObjectId;
  returnInvoiceNumber: number;
  returnInvoiceNo?: string;
  returnDate?: Date | string;
  reason?: string;
  selectedParty?: Types.ObjectId | any;
  items: INewSaleItem[];
  additionalCharges: ICharge[];
  terms?: string;
  notes?: string;
  autoRoundOff?: boolean;
  adjustmentType?: 'add' | 'subtract';
  manualAdjustment?: number;
  totalAmount?: number;
  amountRefunded?: number;
  balanceAmount?: number;
  savedAt?: Date;
  isDeleted?: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const newSaleReturnSchema = new Schema<INewSaleReturn>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  originalSale: { type: Schema.Types.ObjectId, ref: 'NewSale', required: false },
    returnInvoiceNumber: { type: Number, required: true },
    returnInvoiceNo: { type: String },
    returnDate: { type: Schema.Types.Mixed },
    reason: { type: String },
    selectedParty: { type: Schema.Types.ObjectId, ref: 'Party' },
    items: { type: [{
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
    }], default: [] },
    additionalCharges: { type: [{
      id: { type: Schema.Types.Mixed },
      name: { type: String },
      amount: { type: String },
    }], default: [] },
    terms: { type: String, default: '' },
    notes: { type: String, default: '' },
  autoRoundOff: { type: Boolean, default: false },
  adjustmentType: { type: String, enum: ['add', 'subtract'], default: 'add' },
  manualAdjustment: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountRefunded: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
    savedAt: { type: Date, default: () => new Date() },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

newSaleReturnSchema.index({ business: 1, returnInvoiceNumber: 1 }, { unique: false });

if (mongoose.connection && mongoose.connection.models && (mongoose.connection.models as any).NewSaleReturn) {
  try {
    delete (mongoose.connection.models as any).NewSaleReturn;
  } catch (e) {
    // ignore
  }
}

export const NewSaleReturn = (mongoose.models.NewSaleReturn as mongoose.Model<INewSaleReturn>) || mongoose.model<INewSaleReturn>('NewSaleReturn', newSaleReturnSchema);

export default NewSaleReturn;
