import { submitContact } from '@/controllers/contactController';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return submitContact(req);
}
