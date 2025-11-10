
import { NewSaleReturn, INewSaleReturn } from '@/models/NewSaleReturn';
import NewSale from '@/models/NewSale';
import { Transaction } from '@/models/transactionModel';
import { createTransaction, deleteTransaction } from './transactionController';
import Product from '@/models/Product';
import Party from '@/models/Party';
import Counter from '@/models/Counter';
import { connectDB } from '@/lib/db';
import { UserPayload } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// Define a type for the counter object for better type safety
interface CounterType {
  seq?: number;
}

interface NewSaleReturnInput {
  originalSale: string;
  returnDate?: string | Date;
  reason?: string;
  items?: any[];
  additionalCharges?: any[];
  notes?: string;
  totalAmount?: number;
  amountRefunded?: number;
  autoRoundOff?: boolean;
  adjustmentType?: 'add' | 'subtract';
  manualAdjustment?: number;
  selectedParty?: any;
}

export const createNewSaleReturn = async (body: NewSaleReturnInput, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  // originalSale is optional: if provided, validate it; otherwise allow creating a return
  let originalSale: any = null;
  if (body.originalSale) {
    originalSale = await NewSale.findById(body.originalSale);
    if (!originalSale) {
      throw new Error('Original sale not found');
    }
  }

  const counter = await Counter.findOneAndUpdate(
    { business: user.businessId, prefix: 'SR' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seq = counter.seq || 0;

  const createObj: any = {
    ...body,
    business: user.businessId,
    createdBy: user.userId,
    updatedBy: user.userId,
    selectedParty: originalSale ? originalSale.selectedParty : (body.selectedParty || undefined),
    returnInvoiceNumber: seq,
    returnInvoiceNo: `SR-${String(seq).padStart(5, '0')}`
  };

  // Adjust product stock: increment currentStock for each returned item
  try {
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        if (it.productId) {
          await Product.findByIdAndUpdate(it.productId, { $inc: { currentStock: Number(it.qty) || 0 } }).exec();
        }
      }
    }
  } catch (e) {
    console.warn('createNewSaleReturn: error while adjusting product stock', String(e));
  }

  const doc = await NewSaleReturn.create(createObj);
  // create linked transactions for sale return so ledger reflects refund
  try {
    if (doc && doc.selectedParty) {
      const partyId = String(doc.selectedParty);
      const returnAmount = Number((doc as any).totalAmount || (doc as any).balanceAmount || 0) || 0;
      if (returnAmount > 0) {
        const existing = await Transaction.findOne({ 'linked.source': 'newsalereturn', 'linked.refId': doc._id, business: user.businessId }).lean();
        if (!existing) {
          await createTransaction({ partyId, amount: returnAmount, type: 'You Gave', description: (doc as any).returnInvoiceNo || '' , date: (doc as any).returnDate || (doc as any).savedAt || (doc as any).createdAt }, user as any);
          try {
            const tx = await Transaction.findOne({ business: user.businessId, partyId, amount: returnAmount, description: (doc as any).returnInvoiceNo || '' }).sort({ createdAt: -1 }).limit(1).exec();
            if (tx) {
              tx.set('linked', { source: 'newsalereturn', refId: doc._id });
              await tx.save();
            }
          } catch (e) {}
        }
      }

      const refunded = Number((doc as any).amountRefunded || 0) || 0;
      if (refunded > 0) {
        const existingPay = await Transaction.findOne({ 'linked.source': 'newsalereturn_payment', 'linked.refId': doc._id, business: user.businessId }).lean();
        if (!existingPay) {
          const invNo = (doc as any).returnInvoiceNo || '';
          await createTransaction({ partyId, amount: refunded, type: 'You Got', description: invNo, date: (doc as any).returnDate || (doc as any).savedAt || (doc as any).createdAt }, user as any);
          try {
            const tx2 = await Transaction.findOne({ business: user.businessId, partyId, amount: refunded, description: invNo }).sort({ createdAt: -1 }).limit(1).exec();
            if (tx2) { tx2.set('linked', { source: 'newsalereturn_payment', refId: doc._id }); await tx2.save(); }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn('createNewSaleReturn: failed to create linked transactions', String(e));
  }
  // Return populated + normalized document for client convenience
  try {
    const populated = await NewSaleReturn.findById(doc._id)
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();
    if (populated && populated.selectedParty && typeof populated.selectedParty === 'object') {
      const sp = populated.selectedParty as any;
      populated.selectedParty = {
        id: sp._id || sp.id,
        name: sp.partyName || sp.name || '',
        mobileNumber: sp.mobileNumber || sp.mobile || '',
        billingAddress: sp.billingAddress || sp.address || sp.shippingAddress || '',
        shippingAddress: sp.shippingAddress || '',
        gstin: sp.gstin || '',
        openingBalance: sp.openingBalance || 0,
        balance: sp.balance || 0,
      };
    }
    return populated || doc;
  } catch (err: any) {
    // fallback manual lookup
    const raw = await NewSaleReturn.findById(doc._id).lean();
    if (raw && raw.selectedParty && mongoose.connection && mongoose.connection.db) {
      try {
        const p = await mongoose.connection.db.collection('parties').findOne({ _id: new mongoose.Types.ObjectId(String(raw.selectedParty)) }, { projection: { partyName: 1, mobileNumber: 1, billingAddress: 1, shippingAddress: 1, gstin: 1, openingBalance: 1, balance: 1 } });
        if (p) {
          raw.selectedParty = {
            id: p._id,
            name: p.partyName || '',
            mobileNumber: p.mobileNumber || '',
            billingAddress: p.billingAddress || p.address || p.shippingAddress || '',
            shippingAddress: p.shippingAddress || '',
            gstin: p.gstin || '',
            openingBalance: p.openingBalance || 0,
            balance: p.balance || 0,
          };
        }
      } catch (e) {
        // ignore
      }
    }
    return raw || doc;
  }
};

export const getNextSaleReturnInvoicePreview = async (user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const counter = await Counter.findOne({ business: user.businessId, prefix: 'SR' }).lean<CounterType>();
  const nextSeq = (counter && typeof counter.seq === 'number') ? counter.seq + 1 : 1;
  const invoiceNumber = nextSeq;
  const invoiceNo = `SR-${String(invoiceNumber).padStart(5, '0')}`;

  return { invoiceNumber, invoiceNo };
};

export const getAllNewSaleReturns = async (user: UserPayload, options?: { includeDeleted?: boolean }) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const includeDeleted = options?.includeDeleted === true;

  // Try populate first. If the Party model hasn't been registered (MissingSchemaError),
  // fall back to manual collection lookup to avoid runtime crashes during hot reloads.
  let docs: any[] = [];
  try {
    docs = await NewSaleReturn.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false })
      .sort({ createdAt: -1 })
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();
  } catch (err: any) {
    console.warn('getAllNewSaleReturns: populate failed, falling back to manual party lookup:', err?.message || err);
    docs = await NewSaleReturn.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false }).sort({ createdAt: -1 }).lean();

    const ids = Array.from(new Set(docs.map((d: any) => (d.selectedParty ? String(d.selectedParty) : '')).filter(Boolean))) as string[];
    const partiesMap: Record<string, any> = {};
    if (ids.length > 0 && mongoose.connection && mongoose.connection.db) {
      const bsonIds = ids.map(id => new mongoose.Types.ObjectId(id));
      const parties = await mongoose.connection.db.collection('parties').find({ _id: { $in: bsonIds } }, { projection: { partyName: 1, mobileNumber: 1, billingAddress: 1, shippingAddress: 1, gstin: 1, openingBalance: 1, balance: 1 } }).toArray();
      for (const p of parties) partiesMap[String(p._id)] = p;
    }

    for (const d of docs) {
      if (d.selectedParty) {
        const key = String(d.selectedParty);
        if (partiesMap[key]) d.selectedParty = partiesMap[key];
      }
    }
  }

  // normalize selectedParty for frontend convenience
  const normalized = (docs || []).map((d: any) => {
    if (d.selectedParty && typeof d.selectedParty === 'object') {
      const sp = d.selectedParty;
      d.selectedParty = {
        id: sp._id || sp.id,
        name: sp.partyName || sp.name || '',
        mobileNumber: sp.mobileNumber || sp.mobile || '',
        billingAddress: sp.billingAddress || sp.address || sp.shippingAddress || '',
        shippingAddress: sp.shippingAddress || '',
        gstin: sp.gstin || '',
        openingBalance: sp.openingBalance || 0,
        balance: sp.balance || 0,
      };
    }
    return d;
  });

  return normalized;
};

export const getNewSaleReturnById = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');

  // Try to populate selectedParty; if Party model isn't registered (MissingSchemaError),
  // fall back to manual lookup from the collection to avoid 500s during hot reloads.
  try {
    const doc = await NewSaleReturn.findOne({ _id: id, business: user.businessId, isDeleted: false })
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();

    if (!doc) throw new Error('Not found or unauthorized');

    if (doc.selectedParty && typeof doc.selectedParty === 'object') {
      const sp = doc.selectedParty as any;
      doc.selectedParty = {
        id: sp._id || sp.id,
        name: sp.partyName || sp.name || '',
        mobileNumber: sp.mobileNumber || sp.mobile || '',
        billingAddress: sp.billingAddress || sp.address || sp.shippingAddress || '',
        shippingAddress: sp.shippingAddress || '',
        gstin: sp.gstin || '',
        openingBalance: sp.openingBalance || 0,
        balance: sp.balance || 0,
      };
    }

    return doc;
  } catch (err: any) {
    // Fallback: try raw lookup and manually fetch party from the collection
    const raw = await NewSaleReturn.findOne({ _id: id, business: user.businessId, isDeleted: false }).lean();
    if (!raw) throw new Error('Not found or unauthorized');

    if (raw.selectedParty && mongoose.connection && mongoose.connection.db) {
      try {
        const p = await mongoose.connection.db.collection('parties').findOne({ _id: new mongoose.Types.ObjectId(String(raw.selectedParty)) }, { projection: { partyName: 1, mobileNumber: 1, billingAddress: 1, shippingAddress: 1, gstin: 1, openingBalance: 1, balance: 1 } });
        if (p) {
          raw.selectedParty = {
            id: p._id,
            name: p.partyName || '',
            mobileNumber: p.mobileNumber || '',
            billingAddress: p.billingAddress || p.address || p.shippingAddress || '',
            shippingAddress: p.shippingAddress || '',
            gstin: p.gstin || '',
            openingBalance: p.openingBalance || 0,
            balance: p.balance || 0,
          };
        }
      } catch (e) {
        // ignore lookup errors
      }
    }

    return raw;
  }
};

export const updateNewSaleReturn = async (id: string, body: any, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewSaleReturn.findOne({ _id: id, business: user.businessId, isDeleted: false });
  if (!doc) throw new Error('Not found or unauthorized');

  // If items changed in update body, adjust product stock based on delta
  try {
    if (Array.isArray(body.items)) {
      const namesToResolve = new Set<string>();
      for (const it of (doc.items || [])) {
        if (!(it as any).productId && (it as any).name) namesToResolve.add(String((it as any).name).trim());
      }
      for (const it of body.items) {
        if (!it.productId && it.name) namesToResolve.add(String(it.name).trim());
      }

      const nameToId: Record<string, string> = {};
      try {
        const names = Array.from(namesToResolve).filter(Boolean);
        if (names.length > 0) {
          const prods = await Product.find({ business: user.businessId, name: { $in: names } }, { _id: 1, name: 1 }).lean().exec();
          for (const p of prods) nameToId[String(p.name).trim()] = String(p._id);
        }
      } catch (e) {
        console.warn('updateNewSaleReturn: failed to resolve product names to ids', String(e));
      }

      const origMap: Record<string, number> = {};
      for (const it of (doc.items || [])) {
        const pid = (it as any).productId || (it as any).product_id || null;
        if (pid && String(pid).trim()) {
          const key = `id:${String(pid).trim()}`;
          origMap[key] = (origMap[key] || 0) + (Number((it as any).qty) || 0);
          continue;
        }
        const name = (it as any).name ? String((it as any).name).trim() : '';
        if (name) {
          const mappedId = nameToId[name];
          if (mappedId) {
            const key = `id:${mappedId}`;
            origMap[key] = (origMap[key] || 0) + (Number((it as any).qty) || 0);
          } else {
            const key = `name:${name}`;
            origMap[key] = (origMap[key] || 0) + (Number((it as any).qty) || 0);
          }
        }
      }

      const newMap: Record<string, number> = {};
      for (const it of body.items) {
        const pid = (it as any).productId || (it as any).product_id || null;
        if (pid && String(pid).trim()) {
          const key = `id:${String(pid).trim()}`;
          newMap[key] = (newMap[key] || 0) + (Number(it.qty) || 0);
          continue;
        }
        const name = it.name ? String(it.name).trim() : '';
        if (name) {
          const mappedId = nameToId[name];
          if (mappedId) {
            const key = `id:${mappedId}`;
            newMap[key] = (newMap[key] || 0) + (Number(it.qty) || 0);
          } else {
            const key = `name:${name}`;
            newMap[key] = (newMap[key] || 0) + (Number(it.qty) || 0);
          }
        }
      }

      const keys = Array.from(new Set([...Object.keys(origMap), ...Object.keys(newMap)]));
      for (const key of keys) {
        const origQty = origMap[key] || 0;
        const newQty = newMap[key] || 0;
        const delta = newQty - origQty; // for sale returns, creation did +origQty; delta positive => increase stock further
        if (delta === 0) continue;
        try {
          if (key.startsWith('id:')) {
            const id2 = key.slice(3);
            if (mongoose.Types.ObjectId.isValid(id2)) {
              await Product.findByIdAndUpdate(id2, { $inc: { currentStock: Number(delta) } }).exec();
            }
          } else if (key.startsWith('name:')) {
            const name = key.slice(5);
            const p = await Product.findOne({ business: user.businessId, name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: Number(delta) } }).exec();
          }
        } catch (e) {
          console.warn('updateNewSaleReturn: failed to adjust stock for', key, 'delta', delta, String(e));
        }
      }
    }
  } catch (e) {
    console.warn('updateNewSaleReturn: error while computing stock deltas', String(e));
  }

  Object.assign(doc, body, { updatedBy: (user.userId as any) });
  await doc.save();
  // Return populated + normalized version
  try {
    const populated = await NewSaleReturn.findById(doc._id)
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();
    if (populated && populated.selectedParty && typeof populated.selectedParty === 'object') {
      const sp = populated.selectedParty as any;
      populated.selectedParty = {
        id: sp._id || sp.id,
        name: sp.partyName || sp.name || '',
        mobileNumber: sp.mobileNumber || sp.mobile || '',
        billingAddress: sp.billingAddress || sp.address || sp.shippingAddress || '',
        shippingAddress: sp.shippingAddress || '',
        gstin: sp.gstin || '',
        openingBalance: sp.openingBalance || 0,
        balance: sp.balance || 0,
      };
    }
    return populated || doc;
  } catch (err: any) {
    const raw = await NewSaleReturn.findById(doc._id).lean();
    if (raw && raw.selectedParty && mongoose.connection && mongoose.connection.db) {
      try {
        const p = await mongoose.connection.db.collection('parties').findOne({ _id: new mongoose.Types.ObjectId(String(raw.selectedParty)) }, { projection: { partyName: 1, mobileNumber: 1, billingAddress: 1, shippingAddress: 1, gstin: 1, openingBalance: 1, balance: 1 } });
        if (p) {
          raw.selectedParty = {
            id: p._id,
            name: p.partyName || '',
            mobileNumber: p.mobileNumber || '',
            billingAddress: p.billingAddress || p.address || p.shippingAddress || '',
            shippingAddress: p.shippingAddress || '',
            gstin: p.gstin || '',
            openingBalance: p.openingBalance || 0,
            balance: p.balance || 0,
          };
        }
      } catch (e) {
        // ignore
      }
    }
    return raw || doc;
  }
};

export const deleteNewSaleReturn = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewSaleReturn.findOne({ _id: id, business: user.businessId });
  if (!doc) throw new Error('Not found or unauthorized');

  // Mark deleted and reverse stock changes: creation incremented stock, so deleting should decrement
  try {
    if (Array.isArray(doc.items)) {
      for (const it of doc.items) {
        const qty = Number((it as any).qty) || 0;
        const pid = (it as any).productId;
        try {
          if (pid && mongoose.Types.ObjectId.isValid(String(pid))) {
            await Product.findByIdAndUpdate(String(pid), { $inc: { currentStock: -qty } }).exec();
          } else if ((it as any).name) {
            const p = await Product.findOne({ business: user.businessId, name: (it as any).name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: -qty } }).exec();
          }
        } catch (e) {
          console.warn('deleteNewSaleReturn: failed to adjust stock for item', String(e));
        }
      }
    }
  } catch (e) {
    console.warn('deleteNewSaleReturn: error while adjusting stock', String(e));
  }

  doc.isDeleted = true;
  await doc.save();
  // remove linked transactions
  try {
    const txs = await Transaction.find({ 'linked.refId': doc._id, business: user.businessId }).lean();
    for (const t of txs) {
      try {
        await deleteTransaction(String((t as any)._id), user as any);
      } catch (e) {}
    }
  } catch (e) {
    console.warn('deleteNewSaleReturn: failed to remove linked transactions', String(e));
  }
  return { id: doc._id, deleted: true };
};
