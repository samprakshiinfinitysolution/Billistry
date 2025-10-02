import { NewPurchase } from '@/models/NewPurchase';
import Party from '@/models/Party';
import Counter from '@/models/Counter';
import Product from '@/models/Product';
import { connectDB } from '@/lib/db';
import { UserPayload } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

interface NewPurchaseInput {
  invoiceNumber: number;
  invoiceDate?: string | Date;
  dueDate?: string | Date;
  paymentTerms?: string;
  paymentStatus?: 'unpaid' | 'cash' | 'upi' | 'card' | 'netbanking' | 'bank_transfer' | 'cheque' | 'online';
  selectedParty?: any;
  items?: any[];
  additionalCharges?: any[];
  terms?: string;
  notes?: string;
  totalAmount?: number;
  amountReceived?: number;
  balanceAmount?: number;
  autoRoundOff?: boolean;
  adjustmentType?: 'add' | 'subtract';
  manualAdjustment?: number;
}

export const createNewPurchase = async (body: NewPurchaseInput, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  let selectedPartyId: string | undefined;
  if (body.selectedParty) {
    const sp = body.selectedParty as any;
    if (typeof sp === 'string') selectedPartyId = sp;
    else if (typeof sp === 'object') {
      if (sp.id) selectedPartyId = String(sp.id);
      else if (sp._id) selectedPartyId = String(sp._id);
    }
  }

  const createObj: any = {
    ...body,
    business: user.businessId,
    createdBy: user.userId,
    updatedBy: user.userId,
  };

  try {
    // Use the same atomic upsert increment pattern as sales, but scoped to the PUR prefix.
    // This ensures a single DB operation creates or increments the per-business 'PUR' counter
    // and avoids duplicate-key race conditions.
    let counter: any;
    try {
      counter = await Counter.findOneAndUpdate(
        { business: user.businessId, prefix: 'PUR' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).exec();
    } catch (innerErr) {
      // Try to fetch any existing counter doc for debugging to help diagnose race or index issues
      try {
        const existing = await Counter.findOne({ business: user.businessId, prefix: 'PUR' }).lean().exec();
        console.error('createNewPurchase: Counter upsert failed. existing counter:', existing, 'innerErr:', innerErr);
      } catch (fetchErr) {
        console.error('createNewPurchase: Counter upsert failed and fetching existing counter also failed', fetchErr, 'innerErr:', innerErr);
      }
      // If duplicate key error on legacy `business` index, attempt to fix index and retry once
      try {
        const iErr: any = innerErr;
        const isDupBusiness = (iErr && iErr.code === 11000 && iErr.keyPattern && iErr.keyPattern.business);
        if (isDupBusiness && mongoose.connection && mongoose.connection.db) {
          const coll = mongoose.connection.db.collection('counters');
          try {
            // Drop old single-field index if present
            await coll.dropIndex('business_1');
            console.warn('createNewPurchase: dropped legacy business_1 index');
          } catch (dropErr: any) {
            console.warn('createNewPurchase: could not drop business_1 index (may not exist or insufficient privileges):', dropErr?.message || dropErr);
          }
          try {
            // Ensure compound index (business + prefix) exists
            await coll.createIndex({ business: 1, prefix: 1 }, { unique: true });
            console.warn('createNewPurchase: ensured compound index on (business,prefix)');
          } catch (createErr) {
            console.warn('createNewPurchase: could not create compound index:', (createErr as any)?.message || createErr);
          }

          // Retry the upsert once
          try {
            counter = await Counter.findOneAndUpdate(
              { business: user.businessId, prefix: 'PUR' },
              { $inc: { seq: 1 } },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            ).exec();
          } catch (retryErr) {
            console.error('createNewPurchase: retry after index fix failed:', retryErr);
            throw retryErr;
          }
        } else {
          throw innerErr;
        }
      } catch (finalErr) {
        throw finalErr;
      }
    }

    const seq = (counter as any)?.seq || 0;
    createObj.invoiceNumber = seq;
    createObj.invoiceNo = `PUR-${String(seq).padStart(5, '0')}`;
  } catch (err) {
    console.error('Failed to generate purchase invoice number (counter step):', err);
    // rethrow a more descriptive error for server logs
    throw new Error('Failed to generate invoice number');
  }

  if (body.paymentStatus) {
    const allowed = ['unpaid', 'cash', 'upi', 'card', 'netbanking', 'bank', 'bank_transfer', 'cheque', 'online'];
    if (!allowed.includes(body.paymentStatus)) {
      console.error('Invalid paymentStatus received:', body.paymentStatus);
      throw new Error('Invalid paymentStatus');
    }
    createObj.paymentStatus = body.paymentStatus;
  }

  if (selectedPartyId) createObj.selectedParty = selectedPartyId;
  else delete createObj.selectedParty;

  const doc = await NewPurchase.create(createObj);

  // Adjust product stock: increment currentStock for each purchased item if product exists
  try {
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        const prodId = it.productId || it._id || null;
        if (prodId && typeof prodId === 'string') {
          try {
            await Product.findByIdAndUpdate(prodId, { $inc: { currentStock: Number(it.qty) || 0 } }).exec();
          } catch (e) {
            console.warn('createNewPurchase: failed to increment stock for product id', prodId, String(e));
          }
        } else if (it.name) {
          try {
            const p = await Product.findOne({ business: user.businessId, name: it.name }).exec();
            if (p) {
              await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: Number(it.qty) || 0 } }).exec();
            }
          } catch (e) {
            console.warn('createNewPurchase: failed to increment stock for product name', it.name, String(e));
          }
        }
      }
    }
  } catch (e) {
    console.warn('createNewPurchase: error while adjusting product stock', String(e));
  }

  const populated = await NewPurchase.findById(doc._id)
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
};

export const getNextPurchasePreview = async (user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  // Read current PUR counter (do not modify DB). The next sequence will be counter.seq + 1 or 1 when missing.
  const counter = await Counter.findOne({ business: user.businessId, prefix: 'PUR' }).lean();
  const counterAny: any = counter as any;
  const nextSeq = (counterAny && typeof counterAny.seq === 'number') ? counterAny.seq + 1 : 1;
  const invoiceNumber = nextSeq;
  const invoiceNo = `PUR-${String(invoiceNumber).padStart(5, '0')}`;

  return { invoiceNumber, invoiceNo };
};

export const getAllNewPurchases = async (user: UserPayload, options?: { includeDeleted?: boolean }) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const includeDeleted = options?.includeDeleted === true;
  let docs: any[] = [];
  try {
    docs = await NewPurchase.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false })
      .sort({ createdAt: -1 })
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();
  } catch (err: any) {
    console.warn('populate failed, falling back to manual party lookup:', err?.message || err);
    docs = await NewPurchase.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false }).sort({ createdAt: -1 }).lean();
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

export const getNewPurchaseById = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  try {
    const doc = await NewPurchase.findOne({ _id: id, business: user.businessId, isDeleted: false })
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
    console.warn('populate/getOne failed, falling back to manual party lookup:', err?.message || err);
    const doc = await NewPurchase.findOne({ _id: id, business: user.businessId, isDeleted: false }).lean();
    if (!doc) throw new Error('Not found or unauthorized');

    if (doc.selectedParty && mongoose.connection && mongoose.connection.db) {
      try {
        const p = await mongoose.connection.db.collection('parties').findOne({ _id: new mongoose.Types.ObjectId(String(doc.selectedParty)) }, { projection: { partyName: 1, mobileNumber: 1, billingAddress: 1, shippingAddress: 1, gstin: 1, openingBalance: 1, balance: 1 } });
        if (p) {
          doc.selectedParty = {
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
        // ignore and return doc without populated party
      }
    }

    return doc;
  }
};

export const updateNewPurchase = async (id: string, body: Partial<NewPurchaseInput>, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewPurchase.findOne({ _id: id, business: user.businessId, isDeleted: false });
  if (!doc) throw new Error('Not found or unauthorized');

  if (body.selectedParty) {
    const sp = body.selectedParty as any;
    if (typeof sp === 'string') body.selectedParty = sp as any;
    else if (typeof sp === 'object') {
      if (sp.id) body.selectedParty = String(sp.id) as any;
      else if (sp._id) body.selectedParty = String(sp._id) as any;
      else body.selectedParty = undefined as any;
    }
  }

  if (body.paymentStatus) {
    const allowed = ['unpaid', 'cash', 'upi', 'card', 'netbanking', 'bank', 'bank_transfer', 'cheque', 'online'];
    if (!allowed.includes(body.paymentStatus as any)) {
      console.error('Invalid paymentStatus in update:', body.paymentStatus);
      throw new Error('Invalid paymentStatus');
    }
    console.debug('Updating NewPurchase with paymentStatus:', body.paymentStatus);
  }

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
      let nameToId: Record<string, string> = {};
      try {
        const names = Array.from(namesToResolve).filter(Boolean);
        if (names.length > 0) {
          const prods = await Product.find({ business: user.businessId, name: { $in: names } }, { _id: 1, name: 1 }).lean().exec();
          for (const p of prods) nameToId[String(p.name).trim()] = String(p._id);
        }
      } catch (e) {
        console.warn('updateNewPurchase: failed to resolve product names to ids', String(e));
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
        const delta = newQty - origQty;
        if (delta === 0) continue;
        try {
          if (key.startsWith('id:')) {
            const id = key.slice(3);
            if (mongoose.Types.ObjectId.isValid(id)) {
              await Product.findByIdAndUpdate(id, { $inc: { currentStock: Number(delta) } }).exec();
            }
          } else if (key.startsWith('name:')) {
            const name = key.slice(5);
            const p = await Product.findOne({ business: user.businessId, name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: Number(delta) } }).exec();
          }
        } catch (e) {
          console.warn('updateNewPurchase: failed to adjust stock for', key, 'delta', delta, String(e));
        }
      }
    }
  } catch (e) {
    console.warn('updateNewPurchase: error while computing stock deltas', String(e));
  }

  Object.assign(doc, body, { updatedBy: (user.userId as any) });
  await doc.save();
  return doc;
};

export const deleteNewPurchase = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewPurchase.findOne({ _id: id, business: user.businessId });
  if (!doc) throw new Error('Not found or unauthorized');

  // Mark deleted and decrement product stock for items in this purchase (we are removing received stock)
  try {
    if (Array.isArray(doc.items)) {
      for (const it of doc.items) {
        const qty = Number((it as any).qty) || 0;
        const pid = (it as any).productId;
        if (pid && String(pid).trim() && mongoose.Types.ObjectId.isValid(String(pid).trim())) {
          try {
            await Product.findByIdAndUpdate(String(pid).trim(), { $inc: { currentStock: -qty } }).exec();
          } catch (e) {
            console.warn('deleteNewPurchase: failed to decrement stock for product id', pid, String(e));
          }
        } else if ((it as any).name) {
          try {
            const p = await Product.findOne({ business: user.businessId, name: (it as any).name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: -qty } }).exec();
          } catch (e) {
            console.warn('deleteNewPurchase: failed to decrement stock for product name', (it as any).name, String(e));
          }
        }
      }
    }
  } catch (e) {
    console.warn('deleteNewPurchase: error while adjusting stock for deletion', String(e));
  }

  doc.isDeleted = true;
  (doc as any).updatedBy = user.userId;
  await doc.save();
  return { message: 'Deleted' };
};