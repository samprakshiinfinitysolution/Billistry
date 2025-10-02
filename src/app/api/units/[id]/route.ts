<<<<<<< HEAD
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import { Unit } from '@/models/unit';
=======
<<<<<<< HEAD
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import { Unit } from '@/models/unit';

// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   await connectDB();

//   const deleted = await Unit.findByIdAndDelete(params.id);
//   return NextResponse.json({ success: !!deleted });
// }
=======
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Unit } from '@/models/unit';
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed

// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   await connectDB();

<<<<<<< HEAD
//   const deleted = await Unit.findByIdAndDelete(params.id);
//   return NextResponse.json({ success: !!deleted });
// }
=======
  const deleted = await Unit.findByIdAndDelete(params.id);
  return NextResponse.json({ success: !!deleted });
}
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
>>>>>>> 3cfecf3c8e12ea107b03bcb7f8949aaf453d14ed
