import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    userId?: string;
    user?: DefaultSession['user'] & { id?: string };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
  }
}
