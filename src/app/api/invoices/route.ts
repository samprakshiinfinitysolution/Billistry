import { NextRequest, NextResponse } from 'next/server';
import { Invoice } from '@/models/invoiceModel'; // Adjust the import path as necessary
import mongoose from 'mongoose';

interface ItemInput {
  item: string;
  quantity: number;
  rate: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  description?: string;
}

interface CreateInvoiceBody {
  invoiceNo: string;
  type: 'sale' | 'purchase';
  party: string;
  partyModel: 'Customer' | 'Supplier';
  date?: string;
  items: ItemInput[];
  paymentStatus?: string;
  status?: 'Paid' | 'Pending' | 'Cancelled';
  remarks?: string;
}

function calculateItemGST(quantity: number, rate: number, cgstRate = 0, sgstRate = 0, igstRate = 0) {
  const amount = quantity * rate;
  const cgstAmount = (cgstRate / 100) * amount;
  const sgstAmount = (sgstRate / 100) * amount;
  const igstAmount = (igstRate / 100) * amount;
  const totalAmount = amount + cgstAmount + sgstAmount + igstAmount;
  return { amount, cgstAmount, sgstAmount, igstAmount, totalAmount };
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateInvoiceBody = await request.json();

    if (!body.invoiceNo || !body.type || !body.party || !body.partyModel || !body.items?.length) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (!['sale', 'purchase'].includes(body.type)) {
      return NextResponse.json({ message: 'Invalid invoice type' }, { status: 400 });
    }
    if (!['Customer', 'Supplier'].includes(body.partyModel)) {
      return NextResponse.json({ message: 'Invalid party model' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(body.party)) {
      return NextResponse.json({ message: 'Invalid party id' }, { status: 400 });
    }
    for (const i of body.items) {
      if (!mongoose.Types.ObjectId.isValid(i.item)) {
        return NextResponse.json({ message: 'Invalid item id' }, { status: 400 });
      }
      if (i.quantity <= 0 || i.rate < 0) {
        return NextResponse.json({ message: 'Quantity must be positive and rate non-negative' }, { status: 400 });
      }
    }

    let subTotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;
    const processedItems = body.items.map(i => {
      const { amount, cgstAmount, sgstAmount, igstAmount, totalAmount } = calculateItemGST(
        i.quantity,
        i.rate,
        i.cgstRate || 0,
        i.sgstRate || 0,
        i.igstRate || 0
      );
      subTotal += amount;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
      igstTotal += igstAmount;
      return {
        item: i.item,
        description: i.description,
        quantity: i.quantity,
        rate: i.rate,
        cgstRate: i.cgstRate || 0,
        sgstRate: i.sgstRate || 0,
        igstRate: i.igstRate || 0,
        amount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount,
      };
    });

    const totalGst = cgstTotal + sgstTotal + igstTotal;
    const total = subTotal + totalGst;

    const invoice = new Invoice({
      invoiceNo: body.invoiceNo,
      type: body.type,
      party: body.party,
      partyModel: body.partyModel,
      date: body.date ? new Date(body.date) : new Date(),
      items: processedItems,
      subTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalGst,
      total,
      paymentStatus: body.paymentStatus || 'unpaid',
      status: body.status || 'Pending',
      remarks: body.remarks,
    });

    await invoice.save();

    return NextResponse.json({ message: 'Invoice created', invoice }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
  }
}
