import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

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
        if (!credentials?.email || !credentials?.password) return null;
        
        // Simple admin check for now
        if (credentials.email === 'admin@chillandtune.fm' && credentials.password === 'admin123') {
          // Create or find admin user
          let user = await prisma.user.findUnique({ 
            where: { email: 'admin@chillandtune.fm' } 
          });
          
          if (!user) {
            // Create admin user if doesn't exist
            user = await prisma.user.create({
              data: {
                email: 'admin@chillandtune.fm',
                name: 'Admin',
                username: 'admin',
                hashedPassword: 'admin123', // Simple password for now
              }
            });
          }
          
          return { 
            id: user.id, 
            name: user.name ?? user.username, 
            email: user.email, 
            image: user.image ?? null 
          };
        }
        
        return null;
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
    signIn: '/api/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
