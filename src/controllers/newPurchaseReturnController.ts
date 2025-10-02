
import { NewPurchaseReturn, INewPurchaseReturn } from '@/models/NewPurchaseReturn';
import NewPurchase from '@/models/NewPurchase';
import Product from '@/models/Product';
import Party from '@/models/Party';
import Counter from '@/models/Counter';
import { connectDB } from '@/lib/db';
import { UserPayload } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

interface NewPurchaseReturnInput {
  originalPurchase: string;
  returnDate?: string | Date;
  reason?: string;
  items?: any[];
  additionalCharges?: any[];
  notes?: string;
  totalAmount?: number;
  amountPaid?: number;
  autoRoundOff?: boolean;
  adjustmentType?: 'add' | 'subtract';
  manualAdjustment?: number;
}

export const createNewPurchaseReturn = async (body: NewPurchaseReturnInput, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const originalPurchase = await NewPurchase.findById(body.originalPurchase);
  if (!originalPurchase) {
    throw new Error('Original purchase not found');
  }

  const counter = await Counter.findOneAndUpdate(
    { business: user.businessId, prefix: 'PR' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seq = counter.seq || 0;

  const createObj: any = {
    ...body,
    business: user.businessId,
    createdBy: user.userId,
    updatedBy: user.userId,
    selectedParty: originalPurchase.selectedParty,
    returnInvoiceNumber: seq,
    returnInvoiceNo: `PR-${String(seq).padStart(5, '0')}`
  };

  // Adjust product stock: decrement currentStock for each returned item
  try {
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        if (it.productId) {
          await Product.findByIdAndUpdate(it.productId, { $inc: { currentStock: -Number(it.qty) || 0 } }).exec();
        }
      }
    }
  } catch (e) {
    console.warn('createNewPurchaseReturn: error while adjusting product stock', String(e));
  }

  const doc = await NewPurchaseReturn.create(createObj);
  try {
    const populated = await NewPurchaseReturn.findById(doc._id)
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
    const raw = await NewPurchaseReturn.findById(doc._id).lean();
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

export const getNextPurchaseReturnInvoicePreview = async (user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');
  const counter = await Counter.findOne({ business: user.businessId, prefix: 'PR' }).lean();
  const counterAny: any = counter;
  const nextSeq = (counterAny && typeof counterAny.seq === 'number') ? counterAny.seq + 1 : 1;
  const invoiceNumber = nextSeq;
  const invoiceNo = `PR-${String(invoiceNumber).padStart(5, '0')}`;

  return { invoiceNumber, invoiceNo };
};

export const getAllNewPurchaseReturns = async (user: UserPayload, options?: { includeDeleted?: boolean }) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');
  const includeDeleted = options?.includeDeleted === true;

  let docs: any[] = [];
  try {
    docs = await NewPurchaseReturn.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false })
      .sort({ createdAt: -1 })
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();
  } catch (err: any) {
    console.warn('getAllNewPurchaseReturns: populate failed, falling back to manual party lookup:', err?.message || err);
    docs = await NewPurchaseReturn.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false }).sort({ createdAt: -1 }).lean();

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

export const getNewPurchaseReturnById = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');

  const doc = await NewPurchaseReturn.findOne({ _id: id, business: user.businessId, isDeleted: false })
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
};

export const updateNewPurchaseReturn = async (id: string, body: any, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewPurchaseReturn.findOne({ _id: id, business: user.businessId, isDeleted: false });
  if (!doc) throw new Error('Not found or unauthorized');

  // If items changed in update body, adjust product stock based on delta (creation decreased stock, so update should reverse accordingly)
  try {
    if (Array.isArray(body.items)) {
      const namesToResolve = new Set<string>();
      for (const it of (doc.items || [])) {
        if (!(it as any).productId && (it as any).name) namesToResolve.add(String((it as any).name).trim());
      }
      for (const it of body.items) {
        if (!it.productId && it.name) namesToResolve.add(String(it.name).trim());
      }

      let nameToId: Record<string, string> = {};
      try {
        const names = Array.from(namesToResolve).filter(Boolean);
        if (names.length > 0) {
          const prods = await Product.find({ business: user.businessId, name: { $in: names } }, { _id: 1, name: 1 }).lean().exec();
          for (const p of prods) nameToId[String(p.name).trim()] = String(p._id);
        }
      } catch (e) {
        console.warn('updateNewPurchaseReturn: failed to resolve product names to ids', String(e));
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
        const delta = newQty - origQty; // for purchase returns creation decremented stock, so delta positive => further decrement
        if (delta === 0) continue;
        try {
          if (key.startsWith('id:')) {
            const id2 = key.slice(3);
            if (mongoose.Types.ObjectId.isValid(id2)) {
              await Product.findByIdAndUpdate(id2, { $inc: { currentStock: -Number(delta) } }).exec();
            }
          } else if (key.startsWith('name:')) {
            const name = key.slice(5);
            const p = await Product.findOne({ business: user.businessId, name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: -Number(delta) } }).exec();
          }
        } catch (e) {
          console.warn('updateNewPurchaseReturn: failed to adjust stock for', key, 'delta', delta, String(e));
        }
      }
    }
  } catch (e) {
    console.warn('updateNewPurchaseReturn: error while computing stock deltas', String(e));
  }

  Object.assign(doc, body, { updatedBy: (user.userId as any) });
  await doc.save();
  try {
    const populated = await NewPurchaseReturn.findById(doc._id)
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
    const raw = await NewPurchaseReturn.findById(doc._id).lean();
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

export const deleteNewPurchaseReturn = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewPurchaseReturn.findOne({ _id: id, business: user.businessId });
  if (!doc) throw new Error('Not found or unauthorized');

  // Mark deleted and reverse stock changes: creation decremented stock, so deleting should increment stock
  try {
    if (Array.isArray(doc.items)) {
      for (const it of doc.items) {
        const qty = Number((it as any).qty) || 0;
        const pid = (it as any).productId;
        try {
          if (pid && mongoose.Types.ObjectId.isValid(String(pid))) {
            await Product.findByIdAndUpdate(String(pid), { $inc: { currentStock: qty } }).exec();
          } else if ((it as any).name) {
            const p = await Product.findOne({ business: user.businessId, name: (it as any).name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: qty } }).exec();
          }
        } catch (e) {
          console.warn('deleteNewPurchaseReturn: failed to adjust stock for item', String(e));
        }
      }
    }
  } catch (e) {
    console.warn('deleteNewPurchaseReturn: error while adjusting stock', String(e));
  }

  doc.isDeleted = true;
  await doc.save();
  return { id: doc._id, deleted: true };
};
