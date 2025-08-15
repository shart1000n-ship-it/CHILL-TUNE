import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, username, password, name, graduationYear } = await request.json();
    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      return NextResponse.json({ error: 'User exists' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const gradYearInt = graduationYear ? parseInt(String(graduationYear), 10) : undefined;
    const user = await prisma.user.create({ data: { email, username, name, hashedPassword, graduationYear: Number.isFinite(gradYearInt) ? gradYearInt : undefined } });
    return NextResponse.json({ id: user.id, email: user.email, username: user.username });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
