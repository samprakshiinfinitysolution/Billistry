// src/app/api/reports/party-balances/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPartyBalancesReport } from "@/controllers/reportController";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const partyType = (searchParams.get("partyType") || "All") as
    | "Customer"
    | "Supplier"
    | "All";
  const partyId = searchParams.get("partyId") || undefined;

  const data = await getPartyBalancesReport({ startDate, endDate, partyType, partyId });
  return NextResponse.json(data);
}
