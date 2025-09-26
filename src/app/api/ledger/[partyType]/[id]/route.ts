import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/transactionModel";
import Customer  from "@/models/Customer";
import Supplier  from "@/models/Supplier";

// ✅ GET /api/ledger/Customer/:id
// ✅ GET /api/ledger/Supplier/:id
export async function GET(
  req: Request,
  { params }: { params: { partyType: string; id: string } }
) {
  try {
    const { partyType, id } = params;

    // Validate partyType
    if (!["Customer", "Supplier"].includes(partyType)) {
      return NextResponse.json({ error: "Invalid partyType" }, { status: 400 });
    }

    await connectDB();

    // Ensure ObjectId is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Fetch party details from respective collection
    const party =
      partyType === "Customer"
        ? await Customer.findById(id)
        : await Supplier.findById(id);

    if (!party) {
      return NextResponse.json({ error: `${partyType} not found` }, { status: 404 });
    }

    // Fetch all transactions for this party
    const transactions = await Transaction.find({
      partyType,
      partyId: id,
    }).sort({ createdAt: -1 });
    // }).sort({ date: 1 });


    // Calculate totals
    const totalYouGave = transactions
      .filter((t) => t.type === "You Gave")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalYouGot = transactions
      .filter((t) => t.type === "You Got")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalYouGot - totalYouGave; // Positive = they owe you, Negative = you owe them

    return NextResponse.json({
      party: {
        id: party._id,
        name: party.name,
        type: partyType,
      },
      totals: {
        totalYouGave,
        totalYouGot,
        balance,
      },
      transactions,
    });
  } catch (error) {
    console.error("Ledger API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger" },
      { status: 500 }
    );
  }
}
