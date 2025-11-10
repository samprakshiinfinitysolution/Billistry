import { NewSale, INewSale } from '@/models/NewSale';
import Party from '@/models/Party';
import Counter from '@/models/Counter';
import Product from '@/models/Product';
import { Transaction } from '@/models/transactionModel';
import { createTransaction, deleteTransaction } from './transactionController';
import { connectDB } from '@/lib/db';
import { UserPayload } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

interface NewSaleInput {
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

export const createNewSale = async (body: NewSaleInput, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  // Normalize selectedParty: accept object { id | _id } or a string id
  let selectedPartyId: string | undefined;
  if (body.selectedParty) {
    const sp = body.selectedParty as any;
    if (typeof sp === 'string') selectedPartyId = sp;
    else if (typeof sp === 'object') {
      // common shapes: { id: '...', _id: '...', id: ObjectId }
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

  // Assign a monotonic invoice number (and formatted invoiceNo) per business
  try {
    const counter = await Counter.findOneAndUpdate(
      { business: user.businessId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const seq = counter.seq || 0;
    createObj.invoiceNumber = seq;
    createObj.invoiceNo = `INV-${String(seq).padStart(5, '0')}`;
  } catch (err) {
    console.error('Failed to generate invoice number:', err);
    throw new Error('Failed to generate invoice number');
  }

  // Validate paymentStatus if provided
  if (body.paymentStatus) {
    const allowed = ['unpaid', 'cash', 'upi', 'card', 'netbanking', 'bank', 'bank_transfer', 'cheque', 'online'];
    if (!allowed.includes(body.paymentStatus)) {
      console.error('Invalid paymentStatus received:', body.paymentStatus);
      throw new Error('Invalid paymentStatus');
    }
    console.debug('Creating NewSale with paymentStatus:', body.paymentStatus);
    createObj.paymentStatus = body.paymentStatus;
  }

  if (selectedPartyId) createObj.selectedParty = selectedPartyId;
  else delete createObj.selectedParty;

  const doc = await NewSale.create(createObj);
  // Create linked transactions so party ledger shows invoices/payments as live transactions
  try {
    if (doc && doc.selectedParty) {
      const partyId = String(doc.selectedParty);
      // Invoice transaction (You Got)
      const invoiceAmount = Number((doc as any).totalAmount || (doc as any).balanceAmount || 0) || 0;
      if (invoiceAmount > 0) {
        // avoid duplicate: check for existing linked transaction
        const existing = await Transaction.findOne({ 'linked.source': 'newsale', 'linked.refId': doc._id, business: user.businessId }).lean();
        if (!existing) {
          await createTransaction({ partyId, amount: invoiceAmount, type: 'You Got', description: (doc as any).invoiceNo || '' , date: (doc as any).invoiceDate || (doc as any).savedAt || (doc as any).createdAt }, user as any);
          // attach linked info on the created transaction for future deletion (createTransaction doesn't set linked field)
          // find the tx we just created and set linked
          try {
            const tx = await Transaction.findOne({ business: user.businessId, partyId, amount: invoiceAmount, description: (doc as any).invoiceNo || '' }).sort({ createdAt: -1 }).limit(1).exec();
            if (tx) {
              tx.set('linked', { source: 'newsale', refId: doc._id });
              await tx.save();
            }
          } catch (e) {
            // ignore linking failure
          }
        }
      }

      // Payment recorded on invoice: create counter transaction (You Gave) to represent payment
      const amountReceived = Number((doc as any).amountReceived || 0) || 0;
      if (amountReceived > 0) {
        const existingPay = await Transaction.findOne({ 'linked.source': 'newsale_payment', 'linked.refId': doc._id, business: user.businessId }).lean();
        if (!existingPay) {
          // use invoice number as description (no 'Payment for' prefix)
          const invNo = (doc as any).invoiceNo || '';
          await createTransaction({ partyId, amount: amountReceived, type: 'You Gave', description: invNo, date: (doc as any).invoiceDate || (doc as any).savedAt || (doc as any).createdAt }, user as any);
          try {
            const tx2 = await Transaction.findOne({ business: user.businessId, partyId, amount: amountReceived, description: invNo }).sort({ createdAt: -1 }).limit(1).exec();
            if (tx2) {
              tx2.set('linked', { source: 'newsale_payment', refId: doc._id });
              await tx2.save();
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.warn('createNewSale: failed to create linked transactions', String(e));
  }
  // Adjust product stock: decrement currentStock for each sold item if product exists
  try {
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        // Try to find a product by name or id. If `it.productId` exists prefer that shape.
        const prodId = it.productId || it._id || null;
        if (prodId && typeof prodId === 'string') {
          try {
            await Product.findByIdAndUpdate(prodId, { $inc: { currentStock: -(Number(it.qty) || 0) } }).exec();
          } catch (e) {
            console.warn('createNewSale: failed to decrement stock for product id', prodId, String(e));
          }
        } else if (it.name) {
          // fallback: try to find product by exact name within the business
          try {
            const p = await Product.findOne({ business: user.businessId, name: it.name }).exec();
            if (p) {
              await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: -(Number(it.qty) || 0) } }).exec();
            }
          } catch (e) {
            console.warn('createNewSale: failed to decrement stock for product name', it.name, String(e));
          }
        }
      }
    }
  } catch (e) {
    console.warn('createNewSale: error while adjusting product stock', String(e));
  }
  // Populate selectedParty and normalize before returning so the client gets party details
  const populated = await NewSale.findById(doc._id)
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

export const getNextInvoicePreview = async (user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  // Read the current counter without incrementing it; we will return what the NEXT seq would be
  // Do not modify any DB state here.
  const counter = await Counter.findOne({ business: user.businessId }).lean();
  const counterAny: any = counter as any;
  const nextSeq = (counterAny && typeof counterAny.seq === 'number') ? counterAny.seq + 1 : 1;
  const invoiceNumber = nextSeq;
  const invoiceNo = `INV-${String(invoiceNumber).padStart(5, '0')}`;

  return { invoiceNumber, invoiceNo };
};

export const getAllNewSales = async (user: UserPayload, options?: { includeDeleted?: boolean }) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  const includeDeleted = options?.includeDeleted === true;

  // Try using mongoose.populate first. If the Party model hasn't been registered
  // (MissingSchemaError), fall back to a manual lookup using the native Mongo
  // collection to avoid runtime crashes during hot reloads or model-registration
  // ordering issues.
  let docs: any[] = [];
  try {
    docs = await NewSale.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false })
      .sort({ createdAt: -1 })
      .populate({ path: 'selectedParty', select: 'partyName mobileNumber billingAddress shippingAddress gstin openingBalance balance' })
      .lean();
  } catch (err: any) {
    // If populate fails because model isn't registered, do a manual fetch
    console.warn('populate failed, falling back to manual party lookup:', err?.message || err);
    docs = await NewSale.find({ business: user.businessId, isDeleted: includeDeleted ? { $in: [true, false] } : false }).sort({ createdAt: -1 }).lean();

    // Collect unique party ids (strings)
    const ids = Array.from(new Set(docs.map((d: any) => (d.selectedParty ? String(d.selectedParty) : '')).filter(Boolean))) as string[];
    const partiesMap: Record<string, any> = {};
    if (ids.length > 0 && mongoose.connection && mongoose.connection.db) {
      const bsonIds = ids.map(id => new mongoose.Types.ObjectId(id));
      const parties = await mongoose.connection.db.collection('parties').find({ _id: { $in: bsonIds } }, { projection: { partyName: 1, mobileNumber: 1, billingAddress: 1, shippingAddress: 1, gstin: 1, openingBalance: 1, balance: 1 } }).toArray();
      for (const p of parties) partiesMap[String(p._id)] = p;
    }

    // attach raw party doc to selectedParty so normalization below can format it
    for (const d of docs) {
      if (d.selectedParty) {
        const key = String(d.selectedParty);
        if (partiesMap[key]) d.selectedParty = partiesMap[key];
      }
    }
  }

  // normalize selectedParty for frontend convenience (id, name, number, address, balance, gstin)
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

export const getNewSaleById = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  // Try populate first, fallback to manual collection lookup if needed
  try {
    const doc = await NewSale.findOne({ _id: id, business: user.businessId, isDeleted: false })
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
    const doc = await NewSale.findOne({ _id: id, business: user.businessId, isDeleted: false }).lean();
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

export const updateNewSale = async (id: string, body: Partial<NewSaleInput>, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewSale.findOne({ _id: id, business: user.businessId, isDeleted: false });
  if (!doc) throw new Error('Not found or unauthorized');

  // Normalize selectedParty in update body as well
  if (body.selectedParty) {
    const sp = body.selectedParty as any;
    if (typeof sp === 'string') body.selectedParty = sp as any;
    else if (typeof sp === 'object') {
      if (sp.id) body.selectedParty = String(sp.id) as any;
      else if (sp._id) body.selectedParty = String(sp._id) as any;
      else body.selectedParty = undefined as any;
    }
  }

  // Validate paymentStatus in update body
  if (body.paymentStatus) {
    const allowed = ['unpaid', 'cash', 'upi', 'card', 'netbanking', 'bank', 'bank_transfer', 'cheque', 'online'];
    if (!allowed.includes(body.paymentStatus as any)) {
      console.error('Invalid paymentStatus in update:', body.paymentStatus);
      throw new Error('Invalid paymentStatus');
    }
    console.debug('Updating NewSale with paymentStatus:', body.paymentStatus);
  }

  // If items are changed in the update body, we need to adjust product stocks based on the delta
  try {
    if (Array.isArray(body.items)) {
      // Collect names (without productId) from original and new items to resolve into productIds
      const namesToResolve = new Set<string>();
      for (const it of (doc.items || [])) {
        if (!(it as any).productId && (it as any).name) namesToResolve.add(String((it as any).name).trim());
      }
      for (const it of body.items) {
        if (!it.productId && it.name) namesToResolve.add(String(it.name).trim());
      }

      // Resolve names to product ids where possible (within the business)
      const nameToId: Record<string, string> = {};
      try {
        const names = Array.from(namesToResolve).filter(Boolean);
        if (names.length > 0) {
          const prods = await Product.find({ business: user.businessId, name: { $in: names } }, { _id: 1, name: 1 }).lean().exec();
          for (const p of prods) nameToId[String(p.name).trim()] = String(p._id);
        }
      } catch (e) {
        console.warn('updateNewSale: failed to resolve product names to ids', String(e));
      }

      // Build maps keyed by product id when available, otherwise by name
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
        const delta = newQty - origQty; // positive => more sold now, negative => less sold (restore)
        if (delta === 0) continue;
        try {
          if (key.startsWith('id:')) {
            const id = key.slice(3);
            if (mongoose.Types.ObjectId.isValid(id)) {
              await Product.findByIdAndUpdate(id, { $inc: { currentStock: -(delta) } }).exec();
            }
          } else if (key.startsWith('name:')) {
            const name = key.slice(5);
            const p = await Product.findOne({ business: user.businessId, name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: -(delta) } }).exec();
          }
        } catch (e) {
          console.warn('updateNewSale: failed to adjust stock for', key, 'delta', delta, String(e));
        }
      }
    }
  } catch (e) {
    console.warn('updateNewSale: error while computing stock deltas', String(e));
  }

  Object.assign(doc, body, { updatedBy: (user.userId as any) });
  await doc.save();
  return doc;
};

export const deleteNewSale = async (id: string, user: UserPayload) => {
  await connectDB();
  if (!user?.userId || !user?.businessId) throw new Error('Unauthorized');

  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  const doc = await NewSale.findOne({ _id: id, business: user.businessId });
  if (!doc) throw new Error('Not found or unauthorized');

  // Mark deleted and restore stock for items in this sale (since items are no longer sold)
  try {
    if (Array.isArray(doc.items)) {
      for (const it of doc.items) {
        const qty = Number((it as any).qty) || 0;
        const pid = (it as any).productId;
        if (pid && String(pid).trim() && mongoose.Types.ObjectId.isValid(String(pid).trim())) {
          try {
            await Product.findByIdAndUpdate(String(pid).trim(), { $inc: { currentStock: qty } }).exec();
          } catch (e) {
            console.warn('deleteNewSale: failed to restore stock for product id', pid, String(e));
          }
        } else if ((it as any).name) {
          try {
            const p = await Product.findOne({ business: user.businessId, name: (it as any).name }).exec();
            if (p) await Product.findByIdAndUpdate(p._id, { $inc: { currentStock: qty } }).exec();
          } catch (e) {
            console.warn('deleteNewSale: failed to restore stock for product name', (it as any).name, String(e));
          }
        }
      }
    }
  } catch (e) {
    console.warn('deleteNewSale: error while restoring stock', String(e));
  }

  doc.isDeleted = true;
  (doc as any).updatedBy = user.userId;
  await doc.save();
  // remove linked transactions
  try {
    const txs = await Transaction.find({ 'linked.refId': doc._id, business: user.businessId }).lean();
    for (const t of txs) {
      try {
        await deleteTransaction(String((t as any)._id), user as any);
      } catch (e) {
        // ignore individual deletion errors
      }
    }
  } catch (e) {
    console.warn('deleteNewSale: failed to remove linked transactions', String(e));
  }
  return { message: 'Deleted' };
};
