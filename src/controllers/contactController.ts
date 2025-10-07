import { Contact, IContact } from "@/models/contactModel";
import { connectDB } from '@/lib/db';

// ✅ Create
export async function createContact(data: Partial<IContact>): Promise<IContact> {
  await connectDB();
  const contact = await Contact.create(data);
  return contact;
}

// ✅ Read All
export async function getAllContacts(): Promise<IContact[]> {
  await connectDB();
  return Contact.find().sort({ createdAt: -1 });
}

// ✅ Read One
export async function getContactById(id: string): Promise<IContact | null> {
  await connectDB();
  return Contact.findById(id);
}

// ✅ Update
export async function updateContact(
  id: string,
  data: Partial<IContact>
): Promise<IContact | null> {
  await connectDB();
  return Contact.findByIdAndUpdate(id, data, { new: true });
}

// ✅ Delete
export async function deleteContact(id: string): Promise<IContact | null> {
  await connectDB();
  return Contact.findByIdAndDelete(id);
}
