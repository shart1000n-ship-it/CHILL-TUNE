import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
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
        
        // Simple hardcoded admin check - bypass Prisma for now
        if (credentials.email === 'chillandtune.fm' && credentials.password === 'Vibes007') {
          // Return hardcoded admin user
          return { 
            id: 'admin-1', 
            name: 'DJ', 
            email: 'chillandtune.fm', 
            image: null 
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
