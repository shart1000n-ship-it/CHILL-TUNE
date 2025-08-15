import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
  const messages = await prisma.message.findMany({ where: { roomId }, orderBy: { createdAt: 'asc' }, take: 100 });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { roomId, content } = await request.json();
  if (!roomId || !content?.trim()) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  const message = await prisma.message.create({ data: { roomId, senderId: session.userId, content } });
  return NextResponse.json(message);
}
