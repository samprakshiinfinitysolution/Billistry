import Party, { IParty } from "@/models/Party";
import { UserPayload } from "@/lib/middleware/auth";
import mongoose from "mongoose";
import { Transaction } from "@/models/transactionModel";
import { Sale } from "@/models/Sale";
import { Purchase } from "@/models/Purchase";
import { NewSale } from "@/models/NewSale";
import { NewPurchase } from "@/models/NewPurchase";
import { NewSaleReturn } from "@/models/NewSaleReturn";
import { NewPurchaseReturn } from "@/models/NewPurchaseReturn";

// GET all parties (optional filter by type)
export const getParties = async (
  user: UserPayload,
  type?: "Customer" | "Supplier"
): Promise<IParty[]> => {
  const businessId = new mongoose.Types.ObjectId(user.businessId);
  const matchStage: any = { business: businessId, isDeleted: false };
  if (type) {
    matchStage.partyType = type;
  }

  const parties = await Party.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "transactions",
        let: { partyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$partyId", "$$partyId"] },
                  { $eq: ["$business", businessId] },
                ],
              },
            },
          },
        ],
        as: "transactions",
      },
    },
    {
      $addFields: {
        balance: {
          $reduce: {
            input: "$transactions",
            initialValue: "$openingBalance",
            in: {
              $add: [
                "$$value",
                {
                  $cond: {
                    if: { $eq: ["$$this.type", "You Got"] },
                    then: "$$this.amount",
                    else: { $multiply: ["$$this.amount", -1] },
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $project: { transactions: 0 } }, // Exclude transactions array from final output
  ]);

  return parties;
};

// GET single party
export const getPartyById = async (
  id: string,
  user: UserPayload
): Promise<{ party: IParty; transactions: any[] } | null> => {
  const party = await Party.findById(id).lean();
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }

  const transactions = await Transaction.find({ partyId: id, business: user.businessId })
    .sort({ date: -1 })
    .lean();

  // Prefetch linked invoice/return documents so we can show accurate status
  // for transactions that are linked to invoices/returns.
  const linkedIdsBySource: Record<string, Set<string>> = {};
  for (const t of (transactions || [])) {
    try {
      const src = t.linked && t.linked.source ? String(t.linked.source) : undefined;
      const refId = t.linked && t.linked.refId ? String(t.linked.refId) : undefined;
      if (src && refId) {
        const base = src.replace(/_payment$/i, '');
        linkedIdsBySource[base] = linkedIdsBySource[base] || new Set<string>();
        linkedIdsBySource[base].add(refId);
      }
    } catch (e) {
      // ignore malformed linked data
    }
  }

  const nsIds = Array.from(linkedIdsBySource['newsale'] || []);
  const nprIds = Array.from(linkedIdsBySource['newpurchasereturn'] || []);
  const nsrIds = Array.from(linkedIdsBySource['newsalereturn'] || []);
  const npIds = Array.from(linkedIdsBySource['newpurchase'] || []);
  const saleIds = Array.from(linkedIdsBySource['sale'] || []);
  const purchaseIds = Array.from(linkedIdsBySource['purchase'] || []);

  const [prefetchNewSales, prefetchNewPurchases, prefetchSaleReturns, prefetchPurchaseReturns, prefetchSales, prefetchPurchases] = await Promise.all([
    nsIds.length > 0 ? NewSale.find({ _id: { $in: nsIds.map(id => new mongoose.Types.ObjectId(id)) }, business: user.businessId }).lean() : Promise.resolve([]),
    npIds.length > 0 ? NewPurchase.find({ _id: { $in: npIds.map(id => new mongoose.Types.ObjectId(id)) }, business: user.businessId }).lean() : Promise.resolve([]),
    nsrIds.length > 0 ? NewSaleReturn.find({ _id: { $in: nsrIds.map(id => new mongoose.Types.ObjectId(id)) }, business: user.businessId }).lean() : Promise.resolve([]),
    nprIds.length > 0 ? NewPurchaseReturn.find({ _id: { $in: nprIds.map(id => new mongoose.Types.ObjectId(id)) }, business: user.businessId }).lean() : Promise.resolve([]),
    saleIds.length > 0 ? Sale.find({ _id: { $in: saleIds.map(id => new mongoose.Types.ObjectId(id)) }, business: user.businessId }).lean() : Promise.resolve([]),
    purchaseIds.length > 0 ? Purchase.find({ _id: { $in: purchaseIds.map(id => new mongoose.Types.ObjectId(id)) }, business: user.businessId }).lean() : Promise.resolve([]),
  ]);

  const nsMap: Record<string, any> = {};
  const npMap: Record<string, any> = {};
  const nsrMap: Record<string, any> = {};
  const nprMap: Record<string, any> = {};
  const saleMap: Record<string, any> = {};
  const purchaseMap: Record<string, any> = {};
  for (const s of (prefetchNewSales || [])) nsMap[String(s._id)] = s;
  for (const p of (prefetchNewPurchases || [])) npMap[String(p._id)] = p;
  for (const r of (prefetchSaleReturns || [])) nsrMap[String(r._id)] = r;
  for (const r of (prefetchPurchaseReturns || [])) nprMap[String(r._id)] = r;
  for (const s of (prefetchSales || [])) saleMap[String(s._id)] = s;
  for (const p of (prefetchPurchases || [])) purchaseMap[String(p._id)] = p;

  // Map DB transactions to a display-friendly shape with human labels and transaction numbers
  const mappedTransactions = (transactions || []).map((t: any) => {
    // default labels
    let displayType = t.type === 'You Got' ? 'You Got' : 'You Gave';
    let txnNumber = t.description || '';
    const src = t.linked && t.linked.source ? String(t.linked.source) : undefined;

    if (src) {
      // normalize base source by stripping any _payment suffix so payments still map to the original doc type
      const base = src.replace(/_payment$/i, '');
      // If this transaction is linked to a prefetched invoice/return use that doc's
      // paymentStatus and invoice/return number where possible.
      if (base === 'newsale' || base === 'sale') {
        displayType = 'Sales Invoice';
        if (t.linked && t.linked.refId) {
          const ref = String(t.linked.refId);
          const inv = nsMap[ref] || saleMap[ref];
          if (inv) txnNumber = inv.invoiceNo || txnNumber;
          t.status = inv?.paymentStatus || t.status;
        }
      } else if (base === 'newpurchase' || base === 'purchase') {
        displayType = 'Purchase Invoice';
        if (t.linked && t.linked.refId) {
          const ref = String(t.linked.refId);
          const inv = npMap[ref] || purchaseMap[ref];
          if (inv) txnNumber = inv.invoiceNo || txnNumber;
          t.status = inv?.paymentStatus || t.status;
        }
      } else if (base === 'newsalereturn' || base === 'salesreturn') {
        displayType = 'Sales Return';
        if (t.linked && t.linked.refId) {
          const ref = String(t.linked.refId);
          const inv = nsrMap[ref];
          if (inv) txnNumber = inv.returnInvoiceNo || txnNumber;
          t.status = inv?.paymentStatus || t.status;
        }
      } else if (base === 'newpurchasereturn' || base === 'purchasereturn') {
        displayType = 'Purchase Return';
        if (t.linked && t.linked.refId) {
          const ref = String(t.linked.refId);
          const inv = nprMap[ref];
          if (inv) txnNumber = inv.returnInvoiceNo || txnNumber;
          t.status = inv?.paymentStatus || t.status;
        }
      }

      // Payments/refunds created as separate transactions should be labeled as 'Payment' for clarity
      if (/(_payment)$/i.test(String(src))) {
        t.status = 'Payment';
      }

      // Try to extract a canonical invoice/return number from the description when present.
      const numMatch = String(t.description || '').match(/(INV|PUR|SR|PR|INVOICE|RETURN)[-–_\s]*\d{1,6}/i);
      if (numMatch) {
        txnNumber = numMatch[0];
      } else if (t.description && typeof t.description === 'string') {
        const inline = (t.description.match(/(INV|PUR|SR|PR)[-–_\s]*\d{1,6}/i) || [])[0];
        if (inline) txnNumber = inline;
      }
    } else {
      // Defensive inference: if there is no structured linked.source (legacy or timing issue),
      // attempt to infer type from the description (INV/PUR/SR/PR prefixes).
      if (t.description && typeof t.description === 'string') {
        const desc = t.description.toString();
        const match = desc.match(/^(INV|PUR|SR|PR)[-–_\s]*\d{1,6}/i) || desc.match(/(INV|PUR|SR|PR)[-–_\s]*\d{1,6}/i);
        if (match && match[0]) {
          const token = (match[1] || match[0]).toString().toUpperCase();
          // pick friendly label based on token
          if (/^INV/i.test(token)) displayType = 'Sales Invoice';
          else if (/^PUR/i.test(token)) displayType = 'Purchase Invoice';
          else if (/^SR/i.test(token)) displayType = 'Sales Return';
          else if (/^PR/i.test(token)) displayType = 'Purchase Return';
          txnNumber = match[0];
        }
      }
    }

    return {
      _id: t._id,
      amount: t.amount,
      type: displayType,
      description: txnNumber,
      date: t.date || t.createdAt,
      status: t.status || '-',
      source: 'transaction',
      originalId: t._id,
      // docRef links this transaction to an invoice/return doc when available
      docRef: t.linked && t.linked.refId ? String(t.linked.refId) : undefined,
    } as any;
  });

  // Also fetch invoice documents (sales & purchases) related to this party and map
  // them into the same shape so the ledger can display them alongside manual transactions.
  const sales = await Sale.find({ billTo: id, business: user.businessId, isDeleted: { $ne: true } })
    .sort({ date: -1 })
    .lean();

  const purchases = await Purchase.find({ billTo: id, business: user.businessId, isDeleted: { $ne: true } })
    .sort({ date: -1 })
    .lean();

  const mappedSales = (sales || []).map(s => ({
    _id: `sale:${s._id}`,
    amount: s.invoiceAmount,
    // Use friendly label so UI consistently shows 'Sales Invoice'
    type: 'Sales Invoice',
    description: s.invoiceNo || s.notes || '',
    date: s.date || s.createdAt,
    status: s.paymentStatus || 'unpaid',
    source: 'sale',
    originalId: s._id,
    docRef: String(s._id),
  }));

  const mappedPurchases = (purchases || []).map(p => ({
    _id: `purchase:${p._id}`,
    amount: p.invoiceAmount,
    type: 'Purchase Invoice',
    description: p.invoiceNo || p.notes || '',
    date: p.date || p.createdAt,
    status: p.paymentStatus || 'unpaid',
    source: 'purchase',
    originalId: p._id,
    docRef: String(p._id),
  }));

  // New-style invoices (NewSale / NewPurchase)
  const newSales = await NewSale.find({ selectedParty: id, business: user.businessId, isDeleted: { $ne: true } })
    .sort({ savedAt: -1 })
    .lean();

  const newPurchases = await NewPurchase.find({ selectedParty: id, business: user.businessId, isDeleted: { $ne: true } })
    .sort({ savedAt: -1 })
    .lean();

  const mappedNewSales = (newSales || []).map(s => ({
    _id: `newsale:${s._id}`,
    amount: (s as any).totalAmount || (s as any).balanceAmount || 0,
    type: 'Sales Invoice',
    description: (s as any).invoiceNo || (s as any).invoiceNumber?.toString() || (s as any).notes || '',
    date: (s as any).invoiceDate || (s as any).savedAt || (s as any).createdAt,
    status: (s as any).paymentStatus || 'unpaid',
    source: 'newsale',
    originalId: s._id,
    docRef: String(s._id),
  }));

  const mappedNewPurchases = (newPurchases || []).map(p => ({
    _id: `newpurchase:${p._id}`,
    amount: (p as any).totalAmount || (p as any).balanceAmount || 0,
    type: 'Purchase Invoice',
    description: (p as any).invoiceNo || (p as any).invoiceNumber?.toString() || (p as any).notes || '',
    date: (p as any).invoiceDate || (p as any).savedAt || (p as any).createdAt,
    status: (p as any).paymentStatus || 'unpaid',
    source: 'newpurchase',
    originalId: p._id,
    docRef: String(p._id),
  }));

  // Returns
  const saleReturns = await NewSaleReturn.find({ selectedParty: id, business: user.businessId, isDeleted: { $ne: true } })
    .sort({ savedAt: -1 })
    .lean();

  const purchaseReturns = await NewPurchaseReturn.find({ selectedParty: id, business: user.businessId, isDeleted: { $ne: true } })
    .sort({ savedAt: -1 })
    .lean();

  const mappedSaleReturns = (saleReturns || []).map(r => ({
    _id: `salesreturn:${r._id}`,
    amount: (r as any).totalAmount || (r as any).balanceAmount || 0,
    type: 'Sales Return',
    description: (r as any).returnInvoiceNo || (r as any).returnInvoiceNumber?.toString() || (r as any).notes || '',
    date: (r as any).returnDate || (r as any).savedAt || (r as any).createdAt,
    // NewSaleReturn does not always have an explicit paymentStatus field.
    // Derive a sensible status from refund/balance fields so the ledger shows it.
    status: (() => {
      const total = Number((r as any).totalAmount || 0) || 0;
      const refunded = Number((r as any).amountRefunded || 0) || 0;
      const balance = Number((r as any).balanceAmount || 0) || 0;
      if (refunded > 0) return 'Refund'; // some refund was issued
      if (balance > 0) return 'unpaid'; // refund pending
      return '-';
    })(),
    source: 'salesreturn',
    originalId: r._id,
    docRef: String(r._id),
  }));

  const mappedPurchaseReturns = (purchaseReturns || []).map(r => ({
    _id: `purchasereturn:${r._id}`,
    amount: (r as any).totalAmount || (r as any).balanceAmount || 0,
    type: 'Purchase Return',
    description: (r as any).returnInvoiceNo || (r as any).returnInvoiceNumber?.toString() || (r as any).notes || '',
    date: (r as any).returnDate || (r as any).savedAt || (r as any).createdAt,
    // NewPurchaseReturn may not have paymentStatus; derive from paid/balance fields
    status: (() => {
      const total = Number((r as any).totalAmount || 0) || 0;
      const paid = Number((r as any).amountPaid || 0) || 0;
      const balance = Number((r as any).balanceAmount || 0) || 0;
      if (paid > 0) return 'Payment'; // supplier paid / business received payment
      if (balance > 0) return 'unpaid'; // payment pending
      return '-';
    })(),
    source: 'purchasereturn',
    originalId: r._id,
    docRef: String(r._id),
  }));

  // Merge and sort all transactions by the most relevant timestamp (desc).
  // Different docs may use different date fields (invoiceDate/returnDate/savedAt/createdAt/date).
  // Compute a best-effort timestamp per item by checking multiple fields and using the newest value.
  const getItemTimestamp = (it: any) => {
    if (!it) return 0;
    const candidates: any[] = [];
    // Common fields that may contain a meaningful time
    if (it.date) candidates.push(it.date);
    if (it.invoiceDate) candidates.push(it.invoiceDate);
    if (it.returnDate) candidates.push(it.returnDate);
    if (it.savedAt) candidates.push(it.savedAt);
    if (it.createdAt) candidates.push(it.createdAt);
    if (it.updatedAt) candidates.push(it.updatedAt);
    // also consider nested original objects' timestamps if present
    if (it.original && it.original.createdAt) candidates.push(it.original.createdAt);

    let max = 0;
    for (const c of candidates) {
      try {
        const t = new Date(c).getTime();
        if (!Number.isNaN(t) && t > max) max = t;
      } catch (e) {
        // ignore
      }
    }
    return max;
  };

  // Merge all items and deduplicate invoice rows that may appear twice
  // (once as a linked transaction and once as the original invoice document).
  // Deduplication key: type + description + rounded amount. Prefer the item
  // that has a populated status (not '-') when duplicates are found.
  const mergedItems = [
    ...(mappedTransactions || []),
    ...mappedSales,
    ...mappedPurchases,
    ...mappedNewSales,
    ...mappedNewPurchases,
    ...mappedSaleReturns,
    ...mappedPurchaseReturns,
  ];

  const dedupeMap = new Map<string, any>();
  for (const it of mergedItems) {
    const typeKey = (it.type || '').toString();
    const descKey = (it.description || '').toString().trim();
    const amtKey = Math.round((Number(it.amount) || 0) * 100); // paise precision
    const key = `${typeKey}::${descKey}::${amtKey}`;

    const currentHasStatus = it.status && String(it.status) !== '-';

    if (!dedupeMap.has(key)) {
      dedupeMap.set(key, it);
    } else {
      const existing = dedupeMap.get(key);
      const existingHasStatus = existing && existing.status && String(existing.status) !== '-';
      // If current has status and existing doesn't, prefer current. Otherwise keep first-seen.
      if (currentHasStatus && !existingHasStatus) {
        dedupeMap.set(key, it);
      }
    }
  }

  const allTransactions = Array.from(dedupeMap.values()).sort((a, b) => {
    const da = getItemTimestamp(a);
    const db = getItemTimestamp(b);
    return db - da;
  });

  return { party, transactions: allTransactions };
};

// CREATE new party
export const createParty = async (
  body: Partial<IParty>,
  user: UserPayload
): Promise<IParty> => {
  if (!body.partyName?.trim() || !body.mobileNumber?.trim()) {
    throw new Error("Party name and mobile number are required");
  }

  const existing = await Party.findOne({
    mobileNumber: body.mobileNumber.trim(),
    partyType: body.partyType || "Customer",
    business: user.businessId,
    isDeleted: false,
  });

  if (existing) {
    throw new Error(
      `A ${body.partyType || "Customer"} with this mobile number already exists`
    );
  }

  const party = await Party.create({
    partyName: body.partyName.trim(),
    mobileNumber: body.mobileNumber.trim(),
    email: body.email || "",
    gstin: body.gstin || "",
    panNumber: body.panNumber || "",
    partyType: body.partyType || "Customer",
    billingAddress: body.billingAddress || "",
    shippingAddress: body.shippingAddress || "",
    bankDetails: body.bankDetails || {
      accountNumber: "",
      ifsc: "",
      bankName: "",
      accountHolderName: "",
      upiId: "",
    },
    // interpret opening balance and its type (To Collect => positive, To Pay => negative)
    openingBalance: ((): number => {
      const raw = Number(body.openingBalance ?? 0) || 0;
      if ((body as any).openingBalanceType === "To Pay") return -Math.abs(raw);
      return Math.abs(raw);
    })(),
    // initial balance should reflect opening balance (transactions will be added later)
    balance: ((): number => {
      const raw = Number(body.openingBalance ?? 0) || 0;
      return (body as any).openingBalanceType === "To Pay" ? -Math.abs(raw) : Math.abs(raw);
    })(),
    business: user.businessId,
    createdBy: user.userId,
    updatedBy: user.userId,
  });

  return party;
};

// UPDATE party
export const updateParty = async (
  id: string,
  updateData: Partial<IParty>,
  user: UserPayload
): Promise<IParty | null> => {
  const party = await Party.findById(id);
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }

  if ("business" in updateData) delete updateData.business;

  if ("partyName" in updateData && !updateData.partyName?.trim()) {
    throw new Error("Party name is required");
  }
  if ("mobileNumber" in updateData && !updateData.mobileNumber?.trim()) {
    throw new Error("Mobile number is required");
  }

  // Check duplicate mobile number if updated
  if (updateData.mobileNumber && updateData.mobileNumber !== party.mobileNumber) {
    const duplicate = await Party.findOne({
      mobileNumber: updateData.mobileNumber.trim(),
      partyType: updateData.partyType || party.partyType,
      business: user.businessId,
      isDeleted: false,
    });
    if (duplicate) {
      throw new Error(
        `A ${updateData.partyType || party.partyType} with this mobile number already exists`
      );
    }
  }

  Object.assign(party, updateData, { updatedBy: user.userId });
  // If openingBalance or its type was updated, normalize the sign and adjust balance accordingly
  if ("openingBalance" in updateData || "openingBalanceType" in updateData) {
    const raw = Number((updateData as any).openingBalance ?? party.openingBalance) || 0;
    const type = (updateData as any).openingBalanceType ?? (party.openingBalance < 0 ? "To Pay" : "To Collect");
    const normalized = type === "To Pay" ? -Math.abs(raw) : Math.abs(raw);
    // adjust overall balance by removing old opening and adding new one
    party.balance = (party.balance || 0) - (party.openingBalance || 0) + normalized;
    party.openingBalance = normalized;
  }
  await party.save();
  return party;
};

// DELETE (soft delete) party
export const deleteParty = async (
  id: string,
  user: UserPayload
): Promise<IParty | null> => {
  const party = await Party.findById(id);
  if (!party || party.isDeleted || party.business.toString() !== user.businessId) {
    return null;
  }

  party.isDeleted = true;
  party.deletedAt = new Date();
  party.updatedBy = user.userId;
  await party.save();
  return party;
};
