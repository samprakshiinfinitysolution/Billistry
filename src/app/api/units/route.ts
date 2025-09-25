<<<<<<< HEAD
// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import { Unit } from '@/models/unit';

// export async function GET(req: NextRequest) {
//   await connectDB();

//   const searchParams = req.nextUrl.searchParams;
//   const query = searchParams.get('q') || '';

//   const units = await Unit.find({
//     $or: [
//       { name: { $regex: query, $options: 'i' } },
//       { code: { $regex: query, $options: 'i' } },
//     ],
//   }).sort({ name: 1 });

//   return NextResponse.json(units);
// }

// export async function POST(req: NextRequest) {
//   await connectDB();
//   const body = await req.json();

//   const newUnit = await Unit.create(body);
//   return NextResponse.json(newUnit, { status: 201 });
// }
=======
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Unit } from '@/models/unit';

export async function GET(req: NextRequest) {
  await connectDB();

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  const units = await Unit.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { code: { $regex: query, $options: 'i' } },
    ],
  }).sort({ name: 1 });

  return NextResponse.json(units);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const newUnit = await Unit.create(body);
  return NextResponse.json(newUnit, { status: 201 });
}
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
