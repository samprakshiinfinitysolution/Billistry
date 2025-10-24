// app/api/login/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Dummy auth logic – replace with DB query in real app
    if (email === 'admin@example.com' && password === 'admin123') {
      return NextResponse.json({ message: 'Login successful' }, { status: 200 })
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 })
  }
}
