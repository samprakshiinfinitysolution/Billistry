import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { getNextSaleReturnInvoicePreview } from '@/controllers/newSaleReturnController';

export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const preview = await getNextSaleReturnInvoicePreview(user);
  return NextResponse.json({ success: true, data: preview }, { status: 200 });
<<<<<<< HEAD
});
=======
});
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed
