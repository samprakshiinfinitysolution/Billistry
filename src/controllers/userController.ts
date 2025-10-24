// import { NextRequest, NextResponse } from 'next/server';
// import { connectDB } from '@/lib/db';
// import { User } from '@/models/User';

// export const getUsers = async () => {
//   await connectDB();
//   const users = await User.find();
//   return NextResponse.json(users);
// };

// export const updateUserRole = async (req: NextRequest, id: string) => {
//   await connectDB();
//   const { role } = await req.json();
//   const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
//   return NextResponse.json(updatedUser);
// };

// export const deleteUser = async (id: string) => {
//   await connectDB();
//   await User.findByIdAndDelete(id);
//   return NextResponse.json({ message: 'User deleted' });
// };
