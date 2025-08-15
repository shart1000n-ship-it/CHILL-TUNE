import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'alumni' | 'year'
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let roomName: string;
  if (type === 'alumni') {
    roomName = 'Alumni Room';
  } else if (type === 'year') {
    if (!user.graduationYear) return NextResponse.json({ error: 'Set graduationYear' }, { status: 400 });
    roomName = `Alumni ${user.graduationYear}`;
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  // Ensure room exists
  let room = await prisma.chatRoom.findFirst({ where: { name: roomName, isDirect: false } });
  if (!room) {
    room = await prisma.chatRoom.create({ data: { name: roomName, isDirect: false } });
  }

  // Ensure membership
  const membership = await prisma.chatRoomMember.findFirst({ where: { roomId: room.id, userId: user.id } });
  if (!membership) {
    await prisma.chatRoomMember.create({ data: { roomId: room.id, userId: user.id } });
  }

  // Return room with last messages
  const messages = await prisma.message.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ room, messages: messages.reverse() });
}
