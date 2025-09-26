// // app/add-party/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { authMiddleware } from "@/lib/middleware/auth";
// import * as PartyController from "@/controllers/partyController";
// import { asyncHandler } from "@/lib/asyncHandler";

// export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const user = await authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const party = await PartyController.getPartyById(params.id, user);
//   if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 });

//   return NextResponse.json({ success: true, party });
// });

// export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const user = await authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const body = await req.json();
//   const party = await PartyController.updateParty(params.id, body, user);
//   if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 });

//   return NextResponse.json({ success: true, party });
// });

// export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const user = await authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const party = await PartyController.deleteParty(params.id, user);
//   if (!party) return NextResponse.json({ error: "Party not found" }, { status: 404 });

//   return NextResponse.json({ success: true, message: "Party deleted successfully" });
// });



// app/add-party/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import * as PartyController from "@/controllers/partyController";
import { asyncHandler } from "@/lib/asyncHandler";

// GET single party by ID
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const party = await PartyController.getPartyById(params.id, user);
  if (!party) {
    return NextResponse.json(
      { success: false, error: "Party not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, party });
});

// UPDATE party
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const updatedParty = await PartyController.updateParty(params.id, body, user);

  if (!updatedParty) {
    return NextResponse.json(
      { success: false, error: "Party not found or could not be updated" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, party: updatedParty });
});

// DELETE party
export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const deleted = await PartyController.deleteParty(params.id, user);

  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Party not found or could not be deleted" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Party deleted successfully" });
});
