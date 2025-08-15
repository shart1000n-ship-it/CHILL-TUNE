import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<{ id: string; name: string | null; email: string; image: string | null } | null> {
        const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;
        const valid = await bcrypt.compare(password, user.hashedPassword);
        if (!valid) return null;
        return { id: user.id, name: user.name ?? user.username, email: user.email, image: user.image ?? null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'id' in user && typeof user.id === 'string') token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.userId = token.userId;
        if (session.user) session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
