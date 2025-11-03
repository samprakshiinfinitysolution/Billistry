import { NextRequest, NextResponse } from "next/server";
import { getPartyBalance } from "@/controllers/transactionController";

export async function POST(req: NextRequest) {
  try {
    const { partyId, partyType } = await req.json();
    const result = await getPartyBalance(partyId, partyType);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}