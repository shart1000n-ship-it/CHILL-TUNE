import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true, likes: true, comments: true },
    take: 50,
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { content, mediaUrl } = await request.json();
  if (!content && !mediaUrl) return NextResponse.json({ error: 'Empty post' }, { status: 400 });
  const post = await prisma.post.create({ data: { authorId: session.userId as string, content: content ?? '', mediaUrl } });
  return NextResponse.json(post);
}
